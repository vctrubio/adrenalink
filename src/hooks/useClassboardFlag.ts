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
import type { ClassboardModel, ClassboardData } from "@/backend/classboard/ClassboardModel";
import { TeacherQueue as TeacherQueueClass, type EventNode, type ControllerSettings } from "@/backend/classboard/TeacherQueue";
import { GlobalFlag } from "@/backend/classboard/GlobalFlag";
import { getTodayDateString, isDateInRange } from "@/getters/date-getter";
import { DEFAULT_DURATION_CAP_ONE, DEFAULT_DURATION_CAP_TWO, DEFAULT_DURATION_CAP_THREE } from "@/getters/duration-getter";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { createClassboardEvent, deleteClassboardEvent, bulkUpdateClassboardEvents, updateEventStatus } from "@/supabase/server/classboard";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { TeacherProvider } from "@/supabase/server/teachers";

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

interface EventMutationState {
    eventId: string;
    status: EventCardStatus;
    cascadeIds?: string[];
}

// ============ HELPER FUNCTIONS ============

function createEventNode(event: { id: string; date: string; duration: number; location?: string; status: string }, lesson: { id: string; commission: { type: string; cph: string } }, booking: ClassboardData): EventNode {
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
}

export function useClassboardFlag({ initialClassboardModel, serverError }: UseClassboardFlagProps) {
    const { teachers: activeTeachers, loading: teachersLoading, error: teachersError } = useSchoolTeachers();
    const renderCount = useRef(0);
    renderCount.current++;

    // Core state
    const [clientReady, setClientReady] = useState(false);
    const [minDelayPassed, setMinDelayPassed] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel || []);
    const [selectedDate, setSelectedDateState] = useState(() => getTodayDateString());
    const [controller, setControllerState] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);

    const [eventMutations, setEventMutations] = useState<Map<string, EventMutationState>>(new Map());
    const [flagTick, setFlagTick] = useState(0);

    // Derived mounted state
    const mounted = (clientReady && !teachersLoading && minDelayPassed) || !!teachersError;

    // Track previous values for dependency logging
    const lastSyncedControllerRef = useRef<string>("");

    // Refs for capturing latest values (prevents stale closures in callbacks)
    const selectedDateRef = useRef<string>(getTodayDateString());
    const teacherQueuesRef = useRef<TeacherQueueClass[]>([]);
    const controllerRef = useRef<ControllerSettings>(DEFAULT_CONTROLLER);

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
                console.warn(`⏳ [useClassboardFlag] Still waiting for mount (${Math.round(elapsed / 1000)}s). Diagnostics:`, {
                    clientReady,
                    teachersLoading,
                    minDelayPassed,
                    hasError: !!teachersError,
                    mounted,
                });
            }
        }, 2500);

        return () => clearInterval(interval);
    }, [mounted, clientReady, teachersLoading, minDelayPassed, !!teachersError]);

    // Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        const filtered = classboardModel.filter((booking) => isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd));
        return filtered;
    }, [classboardModel, selectedDate]);

    // Build teacher queues from bookings (Sync Pattern)
    // We use a Ref to keep queue instances stable across renders
    const stableQueuesRef = useRef<Map<string, TeacherQueueClass>>(new Map());
    
    // We maintain a state version to force re-renders when queues update internally
    const [queuesVersion, setQueuesVersion] = useState(0);

    const teacherQueues = useMemo(() => {
        // This useMemo now acts as the "Sync Engine"
        // It runs whenever dependencies change, but it updates EXISTING queues instead of creating new ones
        
        const queuesMap = stableQueuesRef.current;
        const currentQueues: TeacherQueueClass[] = [];
        
        // 1. Ensure we have a queue for every active teacher
        activeTeachers.forEach((teacher) => {
            let queue = queuesMap.get(teacher.schema.id);
            if (!queue) {
                queue = new TeacherQueueClass({
                    id: teacher.schema.id,
                    username: teacher.schema.username,
                });
                queuesMap.set(teacher.schema.id, queue);
            }
            currentQueues.push(queue);
        });

        // 2. Sync events for each queue
        // We group events by teacher first for efficiency
        const eventsByTeacher = new Map<string, EventNode[]>();
        
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId || !queuesMap.has(teacherId)) return;

                const sortedEvents = (lesson.events || [])
                    .filter((event) => event.date.split("T")[0] === selectedDate)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                sortedEvents.forEach((event) => {
                    const eventNode = createEventNode(event, lesson, booking);
                    
                    if (!eventsByTeacher.has(teacherId)) {
                        eventsByTeacher.set(teacherId, []);
                    }
                    eventsByTeacher.get(teacherId)!.push(eventNode);
                });
            });
        });

        // 3. Apply sync to each queue
        // Important: Sort events chronologically before syncing to ensure linked list order
        currentQueues.forEach(queue => {
            const teacherEvents = eventsByTeacher.get(queue.teacher.id) || [];
            
            // Sort by date to ensure correct linked list order
            teacherEvents.sort((a, b) => 
                new Date(a.eventData.date).getTime() - new Date(b.eventData.date).getTime()
            );

            // Sync! This updates existing nodes in-place or adds new ones
            queue.syncEvents(teacherEvents);
        });

        return currentQueues;
    }, [activeTeachers, bookingsForSelectedDate, selectedDate]);

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

    // Create GlobalFlag instance once and keep it stable (don't recreate on teacherQueues change)
    const globalFlagRef = useRef<GlobalFlag | null>(null);
    if (!globalFlagRef.current) {
        globalFlagRef.current = new GlobalFlag(teacherQueues, () => {
            setFlagTick((t) => t + 1);
        });
    }
    const globalFlag = globalFlagRef.current;

    // Update GlobalFlag when teacherQueues changes (Sync Pattern)
    useEffect(() => {
        if (!globalFlag) return;
        // Since teacherQueues are now stable objects (synced in-place), 
        // we just need to notify GlobalFlag to refresh the view.
        globalFlag.updateTeacherQueues(teacherQueues);
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
        [globalFlag],
    );

    // Wrapper for setController that updates GlobalFlag (source of truth)
    const setController = useCallback(
        (newController: ControllerSettings) => {
            globalFlag.updateController(newController);
            setControllerState(newController);
        },
        [globalFlag],
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

    const getEventCardStatus = useCallback(
        (eventId: string): EventCardStatus | undefined => {
            if (eventId.startsWith("temp-")) return "posting";
            
            // Check GlobalFlag mutations first
            const mutation = globalFlag.getEventMutation(eventId);
            if (mutation) {
                if (mutation.type === "deleting") return "deleting";
                if (mutation.type === "updating") return "updating";
            }

            // Fallback to local mutation state
            const localMut = eventMutations.get(eventId);
            if (localMut) return localMut.status;
            
            for (const [, mut] of eventMutations) {
                if (mut.cascadeIds?.includes(eventId)) return "updating";
            }
            return undefined;
        },
        [eventMutations, globalFlag, flagTick],
    );

        // ============ EVENT ACTIONS ============
    
        const addLessonEvent = useCallback(async (bookingData: ClassboardData, lessonId: string) => {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
            try {
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    toast.error("Teacher not found for this lesson");
                    return;
                }
    
                const queue = stableQueuesRef.current.get(lesson.teacher.id);
                if (!queue) {
                    toast.error(`${lesson.teacher.username} is not on board today`);
                    return;
                }
    
                const capacityStudents = bookingData.schoolPackage.capacityStudents;
                const controller = controllerRef.current;
                const duration = capacityStudents === 1 ? controller.durationCapOne : capacityStudents === 2 ? controller.durationCapTwo : controller.durationCapThree;
    
                const slotTime = queue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes);
    
                if (!slotTime) {
                    toast.error("Lesson past midnight!");
                    return;
                }
    
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
    
                // Delegate to GlobalFlag
                const optimisticNode = optimisticEventToNode(optimisticEvent);
                globalFlag.addOptimisticEvent(lesson.teacher.id, optimisticNode);
    
                // Then confirm with server in background
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);
    
                if (!result.success) {
                    // Revert via GlobalFlag
                    globalFlag.removeOptimisticEvent(lesson.teacher.id, tempId);
                    toast.error(result.error || "Failed to create event");
                    return;
                }
            } catch (error) {
                console.error("❌ Error adding event:", error);
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (lesson?.teacher) {
                    globalFlag.removeOptimisticEvent(lesson.teacher.id, tempId);
                }
                toast.error("Error creating event");
            }
        }, [globalFlag]);
    
        const deleteEvent = useCallback(
            async (eventId: string, cascade: boolean, queueController?: any) => {
                if (eventId.startsWith("temp-")) {
                    // Find teacher for this temp event to remove it
                    for (const queue of teacherQueues) {
                        if (queue.getAllEvents({ includeDeleted: true }).some(e => e.id === eventId)) {
                            globalFlag.removeOptimisticEvent(queue.teacher.id, eventId);
                            break;
                        }
                    }
                    return;
                }
    
                // Find teacher for this event
                let teacherId = "";
                for (const queue of teacherQueues) {
                    if (queue.getAllEvents({ includeDeleted: true }).some(e => e.id === eventId)) {
                        teacherId = queue.teacher.id;
                        break;
                    }
                }
    
                setEventMutation(eventId, "deleting");
                globalFlag.notifyEventMutation(eventId, "deleting", teacherId);
                if (teacherId) globalFlag.markEventAsDeleted(teacherId, eventId);
    
                try {
                    if (cascade && queueController) {
                        const { deletedId, updates } = queueController.cascadeDeleteAndOptimise(eventId);
                        if (updates.length > 0) {
                            setEventMutation(
                                eventId,
                                "deleting",
                                updates.map((u: any) => u.id),
                            );
                        }
                        await deleteClassboardEvent(deletedId);
                        if (updates.length > 0) await bulkUpdateClassboardEvents(updates, []);
                    } else {
                        const result = await deleteClassboardEvent(eventId);
                        if (!result.success) {
                            clearEventMutation(eventId);
                            globalFlag.clearEventMutation(eventId);
                            if (teacherId) globalFlag.unmarkEventAsDeleted(teacherId, eventId);
                            return;
                        }
                    }
                    // Wait for realtime sync to clean up properly
                } catch (error) {
                    clearEventMutation(eventId);
                    globalFlag.clearEventMutation(eventId);
                    if (teacherId) globalFlag.unmarkEventAsDeleted(teacherId, eventId);
                }
            },
            [setEventMutation, clearEventMutation, teacherQueues, globalFlag],
        );
    
        const updateEventStatusAction = useCallback(
            async (eventId: string, status: string) => {
                // Find teacher for this event
                let teacherId = "";
                let teacherQueue: TeacherQueueClass | null = null;
                for (const queue of teacherQueues) {
                    if (queue.getAllEvents({ includeDeleted: true }).some(e => e.id === eventId)) {
                        teacherId = queue.teacher.id;
                        teacherQueue = queue;
                        break;
                    }
                }

                setEventMutation(eventId, "updating");
                globalFlag.notifyEventMutation(eventId, "updating", teacherId);
                
                // Optimistic in-place update
                if (teacherQueue) {
                    teacherQueue.updateEventStatus(eventId, status as any);
                }

                try {
                    const result = await updateEventStatus(eventId, status);
                    if (!result.success) {
                        toast.error("Failed to update status");
                        // Revert on failure (realtime sync will handle correct state anyway)
                    }
                    clearEventMutation(eventId);
                    globalFlag.clearEventMutation(eventId);
                } catch (error) {
                    console.error("Error updating status:", error);
                    toast.error("Error updating status");
                    clearEventMutation(eventId);
                    globalFlag.clearEventMutation(eventId);
                }
            },
            [setEventMutation, clearEventMutation, teacherQueues, globalFlag]
        );

    // ============ PERSISTENCE ============

    useEffect(() => {
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) setSelectedDateState(storedDate);
        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try {
                setControllerState(JSON.parse(storedController));
            } catch (e) { }
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

    const setClassboardModelWrapper = useCallback((modelOrUpdater: ClassboardModel | ((prev: ClassboardModel) => ClassboardModel)) => {
        if (typeof modelOrUpdater === "function") setClassboardModel((prev) => modelOrUpdater(prev));
        else setClassboardModel(modelOrUpdater);
    }, []);

    const contextValue = useMemo(
        () => ({
            classboardModel,
            bookingsForSelectedDate,
            teacherQueues,
            mounted,
            error: serverError || teachersError,
            selectedDate,
            setSelectedDate,
            controller,
            setController,
            gapMinutes,
            draggedBooking,
            setDraggedBooking,
            addLessonEvent,
            deleteEvent,
            updateEventStatus: updateEventStatusAction,
            getEventCardStatus,
            globalFlag,
            setClassboardModel: setClassboardModelWrapper,
        }),
        [
            classboardModel,
            bookingsForSelectedDate,
            teacherQueues,
            mounted,
            serverError,
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
            getEventCardStatus,
            globalFlag,
            setClassboardModelWrapper,
            queuesVersion,
            flagTick,
        ],
    );

    return contextValue;
}
