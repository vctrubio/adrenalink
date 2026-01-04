"use client";

/**
 * useClassboardFlag - Centralized hook for Classboard state management
 *
 * SINGLE SOURCE OF TRUTH for:
 * 1. Teacher Queues - Built from bookings, managed by GlobalFlag
 * 2. Event Mutations - Optimistic updates with smooth animations
 * 3. Controller Settings - Gap, duration, location settings
 * 4. Adjustment Mode - Edit sessions for teachers
 *
 * ELIMINATES:
 * - useAddLessonEvent.ts (consolidated here)
 * - Prop drilling of gapMinutes, onDeleteComplete
 * - Scattered state across components
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

// ... (helper functions createEventNode, optimisticEventToNode remain same) ...

function createEventNode(event: any, lesson: any, booking: ClassboardData): EventNode {
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
    initialClassboardModel: ClassboardModel;
}

export function useClassboardFlag({ initialClassboardModel }: UseClassboardFlagProps) {
    const { teachers: allSchoolTeachers, loading: teachersLoading, error: teachersError } = useSchoolTeachers();
    const renderCount = useRef(0);
    renderCount.current++;

    // Core state
    const [clientReady, setClientReady] = useState(false);
    const [minDelayPassed, setMinDelayPassed] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel);
    const [selectedDate, setSelectedDateState] = useState(() => getTodayDateString());
    const [controller, setControllerState] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    
    // Unified optimistic state
    const [optimisticOperations, setOptimisticOperations] = useState<Map<string, OptimisticOperation>>(new Map());
    
    const [eventMutations, setEventMutations] = useState<Map<string, EventMutationState>>(new Map());
    const [flagTick, setFlagTick] = useState(0);

    // Derived mounted state: Client is hydrated, teachers are loaded, AND min delay has passed
    const mounted = (clientReady && !teachersLoading && minDelayPassed) || !!teachersError;

    // ... (refs and logging) ...
    const prevTeachersRef = useRef<TeacherModel[]>([]);
    const prevBookingsRef = useRef<ClassboardData[]>([]);
    
    console.log(`🔄 [useClassboardFlag] Render #${renderCount.current} | Date: ${selectedDate} | Ready: ${mounted} (Client: ${clientReady}, Teachers: ${!teachersLoading}, Delay: ${minDelayPassed}, Error: ${!!teachersError})`);

    // ... (effects for delays) ...
    // Min delay effect for branding
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinDelayPassed(true);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    // Long loading logger
    useEffect(() => {
        if (mounted) return;

        // Start checking after 4 seconds (after min delay)
        const startTimeout = setTimeout(() => {
            if (mounted) return;
            
            console.warn("⚠️ [useClassboardFlag] Still waiting for mount. Diagnostics:", {
                clientReady,
                teachersLoading,
                minDelayPassed,
                hasError: !!teachersError,
                error: teachersError
            });

            const interval = setInterval(() => {
                if (!mounted) {
                    console.warn("⏳ [useClassboardFlag] Fetching again / still waiting...", {
                        clientReady,
                        teachersLoading,
                        minDelayPassed,
                        hasError: !!teachersError
                    });
                }
            }, 2500);

            return () => clearInterval(interval);
        }, 4000);

        return () => clearTimeout(startTimeout);
    }, [mounted, clientReady, teachersLoading, minDelayPassed, teachersError]);

    // ... (bookingsForSelectedDate, teacherQueues, globalFlag, effects, callbacks) ...
    // Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        const filtered = classboardModel.filter((booking) =>
            isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd)
        );
        return filtered;
    }, [classboardModel, selectedDate]);

    // Build teacher queues from bookings
    const teacherQueues = useMemo(() => {
        // ... (same as before) ...
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
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

    // GlobalFlag instance
    const globalFlag = useMemo(() => {
        return new GlobalFlag(teacherQueues, () => setFlagTick((t) => t + 1));
    }, []);

    // Update GlobalFlag
    useEffect(() => {
        globalFlag.updateTeacherQueues(teacherQueues);
    }, [teacherQueues, globalFlag]);

    // Sync controller
    useEffect(() => {
        if (mounted) {
            globalFlag.updateController(controller);
        }
    }, [mounted, globalFlag, controller]);

    // ... (setSelectedDate, setController, gapMinutes, mutation tracking) ...
    const setSelectedDate = useCallback((date: string) => {
        globalFlag.onDateChange();
        setSelectedDateState(date);
    }, [selectedDate, globalFlag]);

    const setController = useCallback((newController: ControllerSettings) => {
        globalFlag.updateController(newController);
        setControllerState(newController);
    }, [globalFlag]);

    const gapMinutes = globalFlag.getController().gapMinutes;

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
        // Check if this event is in optimistic state (posting)
        if (eventId.startsWith("temp-")) return "posting";

        // Check unified optimistic operations
        const op = optimisticOperations.get(eventId);
        if (op?.type === "delete") return "deleting";

        // Check mutation state
        const mutation = eventMutations.get(eventId);
        if (mutation) return mutation.status;

        // Check if this event is part of a cascade
        for (const [, mut] of eventMutations) {
            if (mut.cascadeIds?.includes(eventId)) {
                return "updating";
            }
        }

        return undefined;
    }, [eventMutations, optimisticOperations]);

    // ============ EVENT ACTIONS ============

    const addLessonEvent = useCallback(
        async (bookingData: ClassboardData, lessonId: string) => {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log(`➕ [useClassboardFlag] Adding event: ${tempId}`);

            try {
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    toast.error("Teacher not found for this lesson");
                    return;
                }

                const queue = teacherQueues.find((q) => q.teacher.id === lesson.teacher.id);
                if (!queue) {
                    toast.error(`${lesson.teacher.username} is not on board today`);
                    return;
                }

                // Get pending optimistic events for this teacher
                const teacherOptimisticEvents = Array.from(optimisticOperations.values())
                    .filter((op): op is { type: "add"; event: OptimisticEvent } => op.type === "add" && op.event.teacherId === lesson.teacher.id)
                    .map((op) => optimisticEventToNode(op.event));

                const capacityStudents = bookingData.schoolPackage.capacityStudents;
                const duration = capacityStudents === 1 ? controller.durationCapOne : capacityStudents === 2 ? controller.durationCapTwo : controller.durationCapThree;
                const slotTime = queue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes, teacherOptimisticEvents);
                const eventDate = `${selectedDate}T${slotTime}:00`;

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

                // Call server action first
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

                if (!result.success) {
                    toast.error("Failed to create event");
                    return;
                }

                // Add optimistic event operation ONLY after server success
                setOptimisticOperations((prev) => new Map(prev).set(tempId, { type: "add", event: optimisticEvent }));
                console.log(`✅ Event created on server | LessonId: ${lessonId} | TempId: ${tempId}`);
            } catch (error) {
                console.error("❌ Error adding event:", error);
                toast.error("Error creating event");
            }
        },
        [selectedDate, teacherQueues, controller, optimisticOperations]
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
            // Add delete operation
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

    // Clear optimistic operations
    const clearOptimisticOperations = useCallback(() => {
        console.log(`🧹 [useClassboardFlag] Clearing optimistic operations`);
        setOptimisticOperations(new Map());
    }, []);

    // ... (persistence) ...
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
        // Data
        classboardModel,
        bookingsForSelectedDate,
        teacherQueues,
        mounted,
        error: teachersError,

        // Date selection
        selectedDate,
        setSelectedDate,

        // Controller settings
        controller,
        setController,
        gapMinutes,

        // Drag state
        draggedBooking,
        setDraggedBooking,

        // Event actions
        addLessonEvent,
        deleteEvent,

        // Optimistic operations (Unified)
        optimisticOperations,
        setOptimisticOperations,
        clearOptimisticOperations,
        
        getEventCardStatus,

        // Global flag
        globalFlag,

        // Internal
        setClassboardModel: setClassboardModelWrapper,
    }), [
        classboardModel,
        bookingsForSelectedDate,
        teacherQueues,
        mounted,
        teachersError,
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