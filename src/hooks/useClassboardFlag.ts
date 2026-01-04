"use client";

/**
 * useClassboardFlag - Centralized hook for Classboard state management
 *
 * SINGLE SOURCE OF TRUTH for:
 * 1. Teacher Queues - Built from bookings, managed by GlobalFlag
 * 2. Event Mutations - Optimistic updates with smooth animations
 * 3. Controller Settings - Gap, duration, location settings
 * 4. Adjustment Mode - Edit sessions for teachers
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";
import { TeacherQueue as TeacherQueueClass, type EventNode, type ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import { getTodayDateString, isDateInRange } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { createClassboardEvent, deleteClassboardEvent } from "@/actions/classboard-action";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { TeacherModel } from "@/backend/models/TeacherModel";

// ============ CONSTANTS ============

const STORAGE_KEY_DATE = "classboard-selected-date";
const STORAGE_KEY_CONTROLLER = "classboard-controller-settings";

const DEFAULT_CONTROLLER: ControllerSettings = {
    submitTime: "09:00",
    location: "Beach",
    durationCapOne: DEFAULT_DURATION_CAP_ONE,
    durationCapTwo: DEFAULT_DURATION_CAP_TWO,
    durationCapThree: DEFAULT_DURATION_CAP_THREE,
    gapMinutes: 0,
    stepDuration: 30,
    minDuration: 60,
    maxDuration: 180,
    locked: false,
};

// ============ TYPES ============

export type EventCardStatus = "posting" | "updating" | "deleting" | "error";

export interface OptimisticEvent {
    id: string;
    lessonId: string;
    teacherId: string;
    bookingId: string;
    bookingLeaderName: string;
    bookingStudents: {
        id: string;
        firstName: string;
        lastName: string;
        passport: string;
        country: string;
        phone: string;
    }[];
    capacityStudents: number;
    pricePerStudent: number;
    packageDuration: number;
    categoryEquipment: string;
    capacityEquipment: number;
    commission: {
        type: "fixed" | "percentage";
        cph: number;
    };
    date: string;
    duration: number;
    location: string;
}

export type OptimisticOperation = 
    | { type: "add"; event: OptimisticEvent }
    | { type: "delete"; eventId: string };

interface EventMutationState {
    eventId: string;
    status: EventCardStatus;
    cascadeIds?: string[];
}

// ============ HELPER FUNCTIONS ============

function createEventNode(
    event: { id: string; date: string; duration: number; location?: string; status: string }, 
    lesson: { id: string; commission: { type: string; cph: string } }, 
    booking: ClassboardData
): EventNode {
    return {
        id: event.id,
        lessonId: lesson.id,
        bookingId: booking.booking.id,
        bookingLeaderName: booking.booking.leaderStudentName || "Unknown",
        bookingStudents: booking.bookingStudents.map((bs) => ({
            id: bs.student.id,
            firstName: bs.student.firstName,
            lastName: bs.student.lastName,
            passport: bs.student.passport || "",
            country: bs.student.country || "",
            phone: bs.student.phone || "",
        })),
        capacityStudents: booking.schoolPackage.capacityStudents,
        pricePerStudent: booking.schoolPackage.pricePerStudent,
        packageDuration: booking.schoolPackage.durationMinutes,
        categoryEquipment: booking.schoolPackage.categoryEquipment,
        capacityEquipment: booking.schoolPackage.capacityEquipment,
        commission: {
            type: lesson.commission.type as "fixed" | "percentage",
            cph: parseFloat(lesson.commission.cph),
        },
        eventData: {
            date: event.date,
            duration: event.duration,
            location: event.location || "",
            status: event.status as "planned" | "tbc" | "completed" | "uncompleted",
        },
        prev: null,
        next: null,
    };
}

export function optimisticEventToNode(event: OptimisticEvent): EventNode {
    return {
        id: event.id,
        lessonId: event.lessonId,
        bookingId: event.bookingId,
        bookingLeaderName: event.bookingLeaderName,
        bookingStudents: event.bookingStudents,
        capacityStudents: event.capacityStudents,
        pricePerStudent: event.pricePerStudent,
        packageDuration: event.packageDuration,
        categoryEquipment: event.categoryEquipment,
        capacityEquipment: event.capacityEquipment,
        commission: event.commission,
        eventData: {
            date: event.date,
            duration: event.duration,
            location: event.location,
            status: "planned",
        },
        prev: null,
        next: null,
    };
}

// ============ HOOK ============

interface UseClassboardFlagProps {
    initialClassboardModel: ClassboardModel | null;
    serverError?: string | null;
    schoolUsername?: string | null;
}

export function useClassboardFlag({ initialClassboardModel, serverError, schoolUsername }: UseClassboardFlagProps) {
    const { teachers: allSchoolTeachers, loading: teachersLoading, error: teachersError } = useSchoolTeachers();
    const renderCount = useRef(0);
    renderCount.current++;

    // Core state
    const [clientReady, setClientReady] = useState(false);
    const [minDelayPassed, setMinDelayPassed] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel || []);
    const [selectedDate, setSelectedDateState] = useState(() => getTodayDateString());
    const [controller, setControllerState] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    
    // Unified optimistic state
    const [optimisticOperations, setOptimisticOperations] = useState<Map<string, OptimisticOperation>>(new Map());
    
    const [eventMutations, setEventMutations] = useState<Map<string, EventMutationState>>(new Map());
    const [flagTick, setFlagTick] = useState(0);

    // Derived mounted state
    const mounted = (clientReady && !teachersLoading && minDelayPassed) || !!teachersError;

    // Track previous values for dependency logging
    const prevTeachersRef = useRef<TeacherModel[]>([]);
    const prevBookingsRef = useRef<ClassboardData[]>([]);
    const lastSyncedControllerRef = useRef<string>("");

    // Refs for capturing latest values (prevents stale closures in callbacks)
    // Initialized with initial state values that are guaranteed to exist at this point
    const selectedDateRef = useRef<string>(getTodayDateString());
    const teacherQueuesRef = useRef<TeacherQueueClass[]>([]);
    const controllerRef = useRef<ControllerSettings>(DEFAULT_CONTROLLER);
    const optimisticOperationsRef = useRef<Map<string, OptimisticOperation>>(new Map());

    // Min delay effect for branding - run only once
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinDelayPassed(true);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    // Long loading logger - stabilized to prevent resets during render loops
    const loadingStartTimeRef = useRef(Date.now());
    useEffect(() => {
        if (mounted) return;

        const interval = setInterval(() => {
            if (mounted) {
                clearInterval(interval);
                return;
            }

            const elapsed = Date.now() - loadingStartTimeRef.current;
            if (elapsed > 4000) {
                console.warn(`⏳ [useClassboardFlag] Still waiting for mount (${Math.round(elapsed/1000)}s). Diagnostics:`, {
                    clientReady,
                    teachersLoading,
                    minDelayPassed,
                    hasError: !!teachersError,
                    mounted
                });
            }
        }, 2500);

        return () => clearInterval(interval);
    }, [mounted, clientReady, teachersLoading, minDelayPassed, !!teachersError]);

    // Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        const filtered = classboardModel.filter((booking) =>
            isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd)
        );
        return filtered;
    }, [classboardModel, selectedDate]);

    // Build teacher queues from bookings
    const teacherQueues = useMemo(() => {
        const queues = new Map<string, TeacherQueueClass>();
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);

        prevTeachersRef.current = activeTeachers;
        prevBookingsRef.current = bookingsForSelectedDate;

        activeTeachers.forEach((teacher) => {
            const queue = new TeacherQueueClass({
                id: teacher.schema.id,
                username: teacher.schema.username,
            });
            queues.set(teacher.schema.id, queue);
        });

        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId) return;

                const queue = queues.get(teacherId);
                if (!queue) return;

                const sortedEvents = (lesson.events || [])
                    .filter((event) => event.date.split('T')[0] === selectedDate)
                    .sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                sortedEvents.forEach((event) => {
                    const eventNode = createEventNode(event, lesson, booking);
                    queue.constructEvents(eventNode);
                });
            });
        });

        return activeTeachers
            .map((teacher) => queues.get(teacher.schema.id))
            .filter((queue): queue is TeacherQueueClass => queue !== undefined);
    }, [allSchoolTeachers, bookingsForSelectedDate, selectedDate]);

    // Update refs with latest values (for preventing stale closures in callbacks)
    useEffect(() => {
        selectedDateRef.current = selectedDate;
    }, [selectedDate]);

    useEffect(() => {
        teacherQueuesRef.current = teacherQueues;
    }, [teacherQueues]);

    useEffect(() => {
        controllerRef.current = controller;
    }, [controller]);

    useEffect(() => {
        optimisticOperationsRef.current = optimisticOperations;
    }, [optimisticOperations]);

    // Create GlobalFlag instance once and keep it stable (don't recreate on teacherQueues change)
    const globalFlagRef = useRef<GlobalFlag | null>(null);
    if (!globalFlagRef.current) {
        globalFlagRef.current = new GlobalFlag(teacherQueues, () => {
            setFlagTick((t) => t + 1);
        });
    }
    const globalFlag = globalFlagRef.current;

    // Update GlobalFlag when teacherQueues changes (granular, selective updates)
    useEffect(() => {
        if (!globalFlag) return;

        // Get previous queues from GlobalFlag to detect changes
        const prevQueues = globalFlag.getTeacherQueues();

        // Detect which teachers' queues changed
        const changedTeacherIds = new Set<string>();

        teacherQueues.forEach((newQueue) => {
            const oldQueue = prevQueues.find((q) => q.teacher.id === newQueue.teacher.id);

            if (!oldQueue) {
                // New teacher
                changedTeacherIds.add(newQueue.teacher.id);
            } else if (oldQueue !== newQueue) {
                // Queue reference changed (could be new events or structural change)
                changedTeacherIds.add(newQueue.teacher.id);
            }
        });

        // Check for removed teachers
        prevQueues.forEach((oldQueue) => {
            if (!teacherQueues.find((q) => q.teacher.id === oldQueue.teacher.id)) {
                changedTeacherIds.add(oldQueue.teacher.id);
            }
        });

        if (changedTeacherIds.size === 0) return; // No changes

        // Log which teachers changed
        if (changedTeacherIds.size > 0) {
            console.log(`🔄 [useClassboardFlag] Queue updates detected for: ${Array.from(changedTeacherIds).join(", ")}`);
        }

        // Granular updates: only update teachers that changed
        changedTeacherIds.forEach((teacherId) => {
            const newQueue = teacherQueues.find((q) => q.teacher.id === teacherId);
            if (newQueue) {
                globalFlag.updateSingleTeacherQueue(newQueue);
            }
        });
    }, [teacherQueues, globalFlag]);

    // Sync controller with GlobalFlag on mount/change
    useEffect(() => {
        if (!clientReady) return;

        const controllerString = JSON.stringify(controller);
        if (lastSyncedControllerRef.current === controllerString) return;

        globalFlag.updateController(controller);
        lastSyncedControllerRef.current = controllerString;
    }, [clientReady, globalFlag, controller]);

    // Wrapper for setSelectedDate that notifies GlobalFlag
    const setSelectedDate = useCallback(
        (date: string) => {
            globalFlag.onDateChange();
            setSelectedDateState(date);
        },
        [globalFlag]
    );

    // Wrapper for setController that updates GlobalFlag (source of truth)
    const setController = useCallback(
        (newController: ControllerSettings) => {
            globalFlag.updateController(newController);
            setControllerState(newController);
        },
        [globalFlag]
    );

    const gapMinutes = globalFlag.getController().gapMinutes;

    // ============ EVENT MUTATION TRACKING ============

    const setEventMutation = useCallback((eventId: string, status: EventCardStatus, cascadeIds?: string[]) => {
        setEventMutations((prev) => {
            const updated = new Map(prev);
            updated.set(eventId, { eventId, status, cascadeIds });
            return updated;
        });
    }, []);

    const clearEventMutation = useCallback((eventId: string) => {
        setEventMutations((prev) => {
            const updated = new Map(prev);
            updated.delete(eventId);
            return updated;
        });
    }, []);

    const getEventCardStatus = useCallback((eventId: string): EventCardStatus | undefined => {
        if (eventId.startsWith("temp-")) return "posting";
        const op = optimisticOperations.get(eventId);
        if (op?.type === "delete") return "deleting";
        const mutation = eventMutations.get(eventId);
        if (mutation) return mutation.status;
        for (const [, mut] of eventMutations) {
            if (mut.cascadeIds?.includes(eventId)) return "updating";
        }
        return undefined;
    }, [eventMutations, optimisticOperations]);

    // ============ EVENT ACTIONS ============

    const addLessonEvent = useCallback(
        async (bookingData: ClassboardData, lessonId: string) => {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            try {
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    toast.error("Teacher not found for this lesson");
                    return;
                }

                const queue = teacherQueuesRef.current.find((q) => q.teacher.id === lesson.teacher.id);
                if (!queue) {
                    toast.error(`${lesson.teacher.username} is not on board today`);
                    return;
                }

                const teacherOptimisticEvents = Array.from(optimisticOperationsRef.current.values())
                    .filter((op): op is { type: "add"; event: OptimisticEvent } => op.type === "add" && op.event.teacherId === lesson.teacher.id)
                    .map((op) => optimisticEventToNode(op.event));

                const capacityStudents = bookingData.schoolPackage.capacityStudents;
                const controller = controllerRef.current;
                const duration = capacityStudents === 1 ? controller.durationCapOne : capacityStudents === 2 ? controller.durationCapTwo : controller.durationCapThree;
                const slotTime = queue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes, teacherOptimisticEvents);
                const eventDate = `${selectedDateRef.current}T${slotTime}:00`;

                const optimisticEvent: OptimisticEvent = {
                    id: tempId,
                    lessonId,
                    teacherId: lesson.teacher.id,
                    bookingId: bookingData.booking.id,
                    bookingLeaderName: bookingData.booking.leaderStudentName || "Unknown",
                    bookingStudents: bookingData.bookingStudents.map((bs) => ({
                        id: bs.student.id,
                        firstName: bs.student.firstName,
                        lastName: bs.student.lastName,
                        passport: bs.student.passport || "",
                        country: bs.student.country || "",
                        phone: bs.student.phone || "",
                    })),
                    capacityStudents,
                    pricePerStudent: bookingData.schoolPackage.pricePerStudent,
                    packageDuration: bookingData.schoolPackage.durationMinutes,
                    categoryEquipment: bookingData.schoolPackage.categoryEquipment,
                    capacityEquipment: bookingData.schoolPackage.capacityEquipment,
                    commission: {
                        type: lesson.commission.type as "fixed" | "percentage",
                        cph: parseFloat(lesson.commission.cph),
                    },
                    date: eventDate,
                    duration,
                    location: controller.location,
                };

                // Add optimistically FIRST - show immediately
                setOptimisticOperations((prev) => new Map(prev).set(tempId, { type: "add", event: optimisticEvent }));

                // Then confirm with server in background
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

                if (!result.success) {
                    // Revert on failure
                    setOptimisticOperations((prev) => {
                        const updated = new Map(prev);
                        updated.delete(tempId);
                        return updated;
                    });
                    toast.error("Failed to create event");
                    return;
                }
            } catch (error) {
                console.error("❌ Error adding event:", error);
                toast.error("Error creating event");
            }
        },
        []
    );

    const deleteEvent = useCallback(
        async (eventId: string, cascade: boolean, queueController?: any) => {
            if (eventId.startsWith("temp-")) {
                setOptimisticOperations((prev) => {
                    const updated = new Map(prev);
                    updated.delete(eventId);
                    return updated;
                });
                return;
            }

            setEventMutation(eventId, "deleting");
            setOptimisticOperations((prev) => new Map(prev).set(eventId, { type: "delete", eventId }));

            try {
                if (cascade && queueController) {
                    const { deletedId, updates } = queueController.cascadeDeleteAndOptimise(eventId);
                    if (updates.length > 0) {
                        setEventMutation(eventId, "deleting", updates.map((u: any) => u.id));
                    }
                    await deleteClassboardEvent(deletedId);
                    if (updates.length > 0) await bulkUpdateClassboardEvents(updates, []);
                } else {
                    const result = await deleteClassboardEvent(eventId);
                    if (!result.success) {
                        clearEventMutation(eventId);
                        setOptimisticOperations((prev) => {
                            const updated = new Map(prev);
                            updated.delete(eventId);
                            return updated;
                        });
                        return;
                    }
                }
                clearEventMutation(eventId);
            } catch (error) {
                clearEventMutation(eventId);
                setOptimisticOperations((prev) => {
                    const updated = new Map(prev);
                    updated.delete(eventId);
                    return updated;
                });
            }
        },
        [setEventMutation, clearEventMutation]
    );

    const clearOptimisticOperations = useCallback(() => {
        setOptimisticOperations(new Map());
    }, []);

    // ============ PERSISTENCE ============

    useEffect(() => {
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) setSelectedDateState(storedDate);
        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try {
                setControllerState(JSON.parse(storedController));
            } catch (e) {}
        }
        setClientReady(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller, mounted]);

    const setClassboardModelWrapper = useCallback(
        (modelOrUpdater: ClassboardModel | ((prev: ClassboardModel) => ClassboardModel)) => {
            if (typeof modelOrUpdater === "function") setClassboardModel((prev) => modelOrUpdater(prev));
            else setClassboardModel(modelOrUpdater);
        },
        []
    );

    const contextValue = useMemo(() => ({
        classboardModel,
        bookingsForSelectedDate,
        teacherQueues,
        mounted,
        error: serverError || teachersError,
        schoolUsername: schoolUsername || null,
        selectedDate,
        setSelectedDate,
        controller,
        setController,
        gapMinutes,
        draggedBooking,
        setDraggedBooking,
        addLessonEvent,
        deleteEvent,
        optimisticOperations,
        setOptimisticOperations,
        clearOptimisticOperations,
        getEventCardStatus,
        globalFlag,
        setClassboardModel: setClassboardModelWrapper,
    }), [
        classboardModel,
        bookingsForSelectedDate,
        teacherQueues,
        mounted,
        serverError,
        teachersError,
        schoolUsername,
        selectedDate,
        setSelectedDate,
        controller,
        setController,
        gapMinutes,
        draggedBooking,
        setDraggedBooking,
        addLessonEvent,
        deleteEvent,
        optimisticOperations,
        setOptimisticOperations,
        clearOptimisticOperations,
        getEventCardStatus,
        globalFlag,
        setClassboardModelWrapper,
        flagTick
    ]);

    return contextValue;
}