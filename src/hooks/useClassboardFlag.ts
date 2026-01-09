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

    // --- 1. CORE AUTHORITY (Stable across renders) ---
    const stableQueuesRef = useRef<Map<string, TeacherQueueClass>>(new Map());
    const [flagTick, setFlagTick] = useState(0);
    
    const globalFlagRef = useRef<GlobalFlag | null>(null);
    if (!globalFlagRef.current) {
        globalFlagRef.current = new GlobalFlag([], () => {
            setFlagTick((t) => t + 1);
        });
    }
    const globalFlag = globalFlagRef.current;

    // --- 2. BASE STATE ---
    const [clientReady, setClientReady] = useState(false);
    const [minDelayPassed, setMinDelayPassed] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel || []);
    const [selectedDate, setSelectedDateState] = useState(() => getTodayDateString());
    const [controller, setControllerState] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    const [eventMutations, setEventMutations] = useState<Map<string, EventMutationState>>(new Map());

    // --- 3. REFS FOR CALLBACKS ---
    const selectedDateRef = useRef(selectedDate);
    const controllerRef = useRef(controller);
    
    useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
    useEffect(() => { controllerRef.current = controller; }, [controller]);

    // Derived mounted state
    const mounted = (clientReady && !teachersLoading && minDelayPassed) || !!teachersError;

    // Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        return classboardModel.filter((booking) => isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd));
    }, [classboardModel, selectedDate]);

    // --- 4. THE SYNC ENGINE (Patches stable objects) ---
    useEffect(() => {
        if (!activeTeachers.length || !clientReady) return;

        console.log(`⚙️ [SyncEngine] Patching board for ${selectedDate}...`);
        const queuesMap = stableQueuesRef.current;
        const mutatingIds = globalFlag.getMutatingEventIds();

        // A. Ensure teachers exist
        activeTeachers.forEach((teacher) => {
            if (!queuesMap.has(teacher.schema.id)) {
                queuesMap.set(teacher.schema.id, new TeacherQueueClass({
                    id: teacher.schema.id,
                    username: teacher.schema.username,
                }));
            }
        });

        // B. Group events for current date
        const eventsByTeacher = new Map<string, EventNode[]>();
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId || !queuesMap.has(teacherId)) return;

                const dayEvents = (lesson.events || [])
                    .filter((e) => e.date.startsWith(selectedDate))
                    .map((e) => createEventNode(e, lesson, booking));
                
                if (dayEvents.length > 0) {
                    const list = eventsByTeacher.get(teacherId) || [];
                    eventsByTeacher.set(teacherId, [...list, ...dayEvents]);
                }
            });
        });

        // C. Surgical Sync
        queuesMap.forEach((queue, teacherId) => {
            const serverEvents = eventsByTeacher.get(teacherId) || [];
            serverEvents.sort((a, b) => new Date(a.eventData.date).getTime() - new Date(b.eventData.date).getTime());
            
            // Mutation Guard happens inside syncEvents
            queue.syncEvents(serverEvents, mutatingIds);
        });

        // D. Update Global Authority
        const currentQueues = activeTeachers
            .map(t => queuesMap.get(t.schema.id))
            .filter((q): q is TeacherQueueClass => !!q);
            
        globalFlag.updateTeacherQueues(currentQueues);
        
    }, [activeTeachers, bookingsForSelectedDate, selectedDate, clientReady, globalFlag]);

    // Derived reactive array for the UI
    const [queuesVersion, setQueuesVersion] = useState(0); // For forcing stats refresh
    const teacherQueues = useMemo(() => {
        return activeTeachers
            .map(t => stableQueuesRef.current.get(t.schema.id))
            .filter((q): q is TeacherQueueClass => !!q);
    }, [activeTeachers, flagTick]);

    // --- 5. EFFECTS ---

    useEffect(() => {
        const timer = setTimeout(() => setMinDelayPassed(true), 3500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!clientReady) return;
        globalFlag.updateController(controller);
    }, [clientReady, globalFlag, controller]);

    const setSelectedDate = useCallback((date: string) => {
        globalFlag.onDateChange(); // Clears internal optimistic state
        setSelectedDateState(date);
    }, [globalFlag]);

    const setController = useCallback((newController: ControllerSettings) => {
        globalFlag.updateController(newController);
        setControllerState(newController);
    }, [globalFlag]);

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
            
            const mutation = globalFlag.getEventMutation(eventId);
            if (mutation) {
                if (mutation.type === "deleting") return "deleting";
                if (mutation.type === "updating") return "updating";
            }

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

            const optimisticNode = optimisticEventToNode(optimisticEvent);
            globalFlag.addOptimisticEvent(lesson.teacher.id, optimisticNode);

            const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

            if (!result.success) {
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
                const q = Array.from(stableQueuesRef.current.values()).find(q => q.getAllEvents({ includeDeleted: true }).some(e => e.id === eventId));
                if (q) globalFlag.removeOptimisticEvent(q.teacher.id, eventId);
                return;
            }

            const currentQueues = Array.from(stableQueuesRef.current.values());
            let teacherId = "";
            let queue: TeacherQueueClass | null = null;
            for (const q of currentQueues) {
                if (q.getAllEvents({ includeDeleted: true }).some(e => e.id === eventId)) {
                    teacherId = q.teacher.id;
                    queue = q;
                    break;
                }
            }

            if (!queue) return;

            setEventMutation(eventId, "deleting");
            globalFlag.notifyEventMutation(eventId, "deleting", teacherId);
            globalFlag.markEventAsDeleted(teacherId, eventId);

            let shiftUpdates: { id: string; date: string; duration: number }[] = [];            
            try {
                if (cascade && queueController) {
                    const cascadeResult = queueController.cascadeDeleteAndOptimise(eventId);
                    shiftUpdates = cascadeResult.updates;
                    
                    if (shiftUpdates.length > 0) {
                        shiftUpdates.forEach(u => {
                            globalFlag.notifyEventMutation(u.id, "updating", teacherId);
                            const node = queue!.getAllEvents({ includeDeleted: true }).find(e => e.id === u.id);
                            if (node) node.eventData.date = u.date;
                        });
                        queue!.rebuildQueue(queue!.getAllEvents({ includeDeleted: true }));
                    }                                            
                    await deleteClassboardEvent(eventId);
                    if (shiftUpdates.length > 0) {
                        await bulkUpdateClassboardEvents(shiftUpdates, []);
                        shiftUpdates.forEach(u => globalFlag.clearEventMutation(u.id));
                    }
                } else {
                    const result = await deleteClassboardEvent(eventId);
                    if (!result.success) {
                        clearEventMutation(eventId);
                        globalFlag.clearEventMutation(eventId);
                        globalFlag.unmarkEventAsDeleted(teacherId, eventId);
                        toast.error("Failed to delete event");
                        return;
                    }
                }
                setTimeout(() => globalFlag.clearEventMutation(eventId), 10000);
            } catch (error) {
                console.error("❌ Error during deletion:", error);
                toast.error("Failed to update board");
                globalFlag.unmarkEventAsDeleted(teacherId, eventId);
                clearEventMutation(eventId);
                globalFlag.clearEventMutation(eventId);
                shiftUpdates.forEach(u => globalFlag.clearEventMutation(u.id));
            }
        },
        [setEventMutation, clearEventMutation, globalFlag, gapMinutes],
    );    

    const updateEventStatusAction = useCallback(
        async (eventId: string, status: string) => {
            const currentQueues = Array.from(stableQueuesRef.current.values());
            let teacherId = "";
            let teacherQueue: TeacherQueueClass | null = null;
            for (const q of currentQueues) {
                if (q.getAllEvents({ includeDeleted: true }).some(e => e.id === eventId)) {
                    teacherId = q.teacher.id;
                    teacherQueue = q;
                    break;
                }
            }

            setEventMutation(eventId, "updating");
            globalFlag.notifyEventMutation(eventId, "updating", teacherId);
            
            if (teacherQueue) {
                teacherQueue.updateEventStatus(eventId, status as any);
            }

            try {
                const result = await updateEventStatus(eventId, status);
                if (!result.success) toast.error("Failed to update status");
                clearEventMutation(eventId);
                globalFlag.clearEventMutation(eventId);
            } catch (error) {
                console.error("Error updating status:", error);
                toast.error("Error updating status");
                clearEventMutation(eventId);
                globalFlag.clearEventMutation(eventId);
            }
        },
        [setEventMutation, clearEventMutation, globalFlag]
    );

    // ============ PERSISTENCE ============

    useEffect(() => {
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) setSelectedDateState(storedDate);
        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try { setControllerState(JSON.parse(storedController)); } catch (e) { }
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