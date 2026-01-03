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

interface EventMutationState {
    eventId: string;
    status: EventCardStatus;
    cascadeIds?: string[];
}

// ============ HELPER FUNCTIONS ============

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
    const { teachers: allSchoolTeachers } = useSchoolTeachers();
    const renderCount = useRef(0);
    renderCount.current++;

    // Core state
    const [mounted, setMounted] = useState(false);
    const [classboardModel, setClassboardModel] = useState<ClassboardModel>(initialClassboardModel);
    const [selectedDate, setSelectedDateState] = useState(() => getTodayDateString());
    const [controller, setControllerState] = useState<ControllerSettings>(DEFAULT_CONTROLLER);
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    const [optimisticEvents, setOptimisticEvents] = useState<Map<string, OptimisticEvent>>(new Map());
    const [eventMutations, setEventMutations] = useState<Map<string, EventMutationState>>(new Map());
    const [flagTick, setFlagTick] = useState(0);

    // Track previous values for dependency logging
    const prevTeachersRef = useRef<TeacherModel[]>([]);
    const prevBookingsRef = useRef<ClassboardData[]>([]);

    console.log(`🔄 [useClassboardFlag] Render #${renderCount.current} | Date: ${selectedDate}`);

    // Filter bookings by selected date
    const bookingsForSelectedDate = useMemo(() => {
        const filtered = classboardModel.filter((booking) =>
            isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd)
        );
        console.log(`📅 [useClassboardFlag] Bookings for ${selectedDate}: ${filtered.length}/${classboardModel.length}`);
        return filtered;
    }, [classboardModel, selectedDate]);

    // Build teacher queues from bookings
    const teacherQueues = useMemo(() => {
        console.log(`🏗️ [useClassboardFlag] Building teacher queues...`);

        const queues = new Map<string, TeacherQueueClass>();
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);

        // Log dependency changes
        if (prevTeachersRef.current.length !== activeTeachers.length) {
            console.log(`👥 [useClassboardFlag] Teachers changed: ${prevTeachersRef.current.length} -> ${activeTeachers.length}`);
        }
        prevTeachersRef.current = activeTeachers;

        if (prevBookingsRef.current.length !== bookingsForSelectedDate.length) {
            console.log(`📦 [useClassboardFlag] Bookings changed: ${prevBookingsRef.current.length} -> ${bookingsForSelectedDate.length}`);
        }
        prevBookingsRef.current = bookingsForSelectedDate;

        // Initialize queues for ALL teachers (active or not, but filter later)
        activeTeachers.forEach((teacher) => {
            const queue = new TeacherQueueClass({
                id: teacher.schema.id,
                username: teacher.schema.username,
            });
            queues.set(teacher.schema.id, queue);
            console.log(`  📌 [TeacherQueue] Created: ${teacher.schema.username}`);
        });

        // Populate queues with events from bookings
        let totalEvents = 0;
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
                    totalEvents++;
                    console.log(`    🎫 [Event] ${queue.teacher.username} -> ${booking.booking.leaderStudentName}`);
                });
            });
        });

        console.log(`✅ [useClassboardFlag] Built ${queues.size} queues with ${totalEvents} total events`);

        return activeTeachers
            .map((teacher) => queues.get(teacher.schema.id))
            .filter((queue): queue is TeacherQueueClass => queue !== undefined);
    }, [allSchoolTeachers, bookingsForSelectedDate, selectedDate]);

    // Create GlobalFlag instance (stable reference)
    const globalFlag = useMemo(() => {
        console.log(`🚩 [useClassboardFlag] Creating GlobalFlag instance`);
        return new GlobalFlag(teacherQueues, () => setFlagTick((t) => t + 1));
    }, []);

    // Update GlobalFlag when dependencies change
    useEffect(() => {
        console.log(`🔄 [useClassboardFlag] Updating GlobalFlag with ${teacherQueues.length} queues`);
        globalFlag.updateTeacherQueues(teacherQueues);
    }, [teacherQueues, globalFlag]);

    // Sync controller with GlobalFlag on mount
    useEffect(() => {
        if (mounted) {
            console.log(`🔄 [useClassboardFlag] Syncing controller -> GlobalFlag`);
            globalFlag.updateController(controller);
        }
    }, [mounted, globalFlag, controller]);

    // Wrapper for setSelectedDate that notifies GlobalFlag
    const setSelectedDate = useCallback(
        (date: string) => {
            console.log(`📆 [useClassboardFlag] Date changed: ${selectedDate} -> ${date}`);
            globalFlag.onDateChange();
            setSelectedDateState(date);
        },
        [selectedDate, globalFlag]
    );

    // Wrapper for setController that updates GlobalFlag (source of truth)
    const setController = useCallback(
        (newController: ControllerSettings) => {
            console.log(`⚙️ [useClassboardFlag] Controller updated -> GlobalFlag`);
            globalFlag.updateController(newController);
            // Also update local state for persistence
            setControllerState(newController);
        },
        [globalFlag]
    );

    // gapMinutes comes from GlobalFlag (source of truth)
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
            // Check if this event is in optimistic state (posting)
            if (eventId.startsWith("temp-")) return "posting";

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
        },
        [eventMutations]
    );

    // ============ EVENT ACTIONS ============

    const addLessonEvent = useCallback(
        async (bookingData: ClassboardData, lessonId: string) => {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log(`➕ [useClassboardFlag] Adding event: ${tempId}`);

            try {
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    console.error("❌ Lesson or teacher not found");
                    toast.error("Teacher not found for this lesson");
                    return;
                }

                const queue = teacherQueues.find((q) => q.teacher.id === lesson.teacher.id);
                if (!queue) {
                    console.error(`❌ Teacher not on board: ${lesson.teacher.username}`);
                    toast.error(`${lesson.teacher.username} is not on board today`);
                    return;
                }

                const capacityStudents = bookingData.schoolPackage.capacityStudents;
                const duration =
                    capacityStudents === 1
                        ? controller.durationCapOne
                        : capacityStudents === 2
                          ? controller.durationCapTwo
                          : controller.durationCapThree;

                const slotTime = queue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes);
                const eventDate = `${selectedDate}T${slotTime}:00`;

                console.log(`  📍 Slot: ${slotTime} | Duration: ${duration}min | Teacher: ${queue.teacher.username}`);

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
                    capacityStudents: bookingData.schoolPackage.capacityStudents,
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

                // Add optimistic event
                setOptimisticEvents((prev) => new Map(prev).set(tempId, optimisticEvent));
                console.log(`  🎨 Optimistic event added: ${tempId}`);

                // Call server action WITHOUT awaiting full subscription
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

                if (!result.success) {
                    console.error("❌ Failed to create event:", result.error);
                    setOptimisticEvents((prev) => {
                        const updated = new Map(prev);
                        updated.delete(tempId);
                        return updated;
                    });
                    toast.error("Failed to create event");
                    return;
                }

                console.log(`✅ Event created on server | LessonId: ${lessonId} | TempId: ${tempId}`);
                // Note: Optimistic event will be replaced by real event when subscription fires
            } catch (error) {
                console.error("❌ Error adding event:", error);
                setOptimisticEvents((prev) => {
                    const updated = new Map(prev);
                    updated.delete(tempId);
                    return updated;
                });
                toast.error("Error creating event");
            }
        },
        [selectedDate, teacherQueues, controller]
    );

    const deleteEvent = useCallback(
        async (eventId: string, cascade: boolean, queueController?: any) => {
            // Clean up optimistic event if it exists
            if (eventId.startsWith("temp-")) {
                console.log(`🗑️ [useClassboardFlag] Removing optimistic event: ${eventId}`);
                setOptimisticEvents((prev) => {
                    const updated = new Map(prev);
                    updated.delete(eventId);
                    return updated;
                });
                return;
            }
            console.log(`🗑️ [useClassboardFlag] Deleting event: ${eventId} | Cascade: ${cascade}`);

            setEventMutation(eventId, "deleting");

            try {
                if (cascade && queueController) {
                    const { deletedId, updates } = queueController.cascadeDeleteAndOptimise(eventId);

                    // Set cascade IDs for animation
                    if (updates.length > 0) {
                        setEventMutation(eventId, "deleting", updates.map((u: any) => u.id));
                    }

                    await deleteClassboardEvent(deletedId);

                    if (updates.length > 0) {
                        await bulkUpdateClassboardEvents(updates, []);
                    }

                    console.log(`✅ Cascade delete complete: ${updates.length} events updated`);
                } else {
                    const result = await deleteClassboardEvent(eventId);
                    if (!result.success) {
                        console.error("Delete failed:", result.error);
                        clearEventMutation(eventId);
                        return;
                    }
                }

                clearEventMutation(eventId);
                console.log("✅ Event deleted");
            } catch (error) {
                console.error("❌ Error deleting event:", error);
                clearEventMutation(eventId);
            }
        },
        [setEventMutation, clearEventMutation]
    );

    // Clear optimistic events (called by realtime sync)
    const clearOptimisticEvents = useCallback(() => {
        console.log(`🧹 [useClassboardFlag] Clearing ${optimisticEvents.size} optimistic events`);
        setOptimisticEvents(new Map());
    }, [optimisticEvents.size]);

    // ============ PERSISTENCE ============

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
        if (storedDate) {
            setSelectedDateState(storedDate);
        }

        const storedController = localStorage.getItem(STORAGE_KEY_CONTROLLER);
        if (storedController) {
            try {
                const parsed = JSON.parse(storedController) as ControllerSettings;
                setControllerState(parsed);
            } catch (error) {
                console.error("❌ Failed to parse controller settings:", error);
            }
        }

        setMounted(true);
        console.log(`🚀 [useClassboardFlag] Mounted`);
    }, []);

    // Persist selectedDate to localStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    }, [selectedDate, mounted]);

    // Persist controller to localStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_CONTROLLER, JSON.stringify(controller));
    }, [controller, mounted]);

    // Wrapper for setClassboardModel that accepts function updates
    const setClassboardModelWrapper = useCallback(
        (modelOrUpdater: ClassboardModel | ((prev: ClassboardModel) => ClassboardModel)) => {
            if (typeof modelOrUpdater === "function") {
                setClassboardModel((prev) => modelOrUpdater(prev));
            } else {
                setClassboardModel(modelOrUpdater);
            }
        },
        []
    );

    return {
        // Data
        classboardModel,
        bookingsForSelectedDate,
        teacherQueues,
        mounted,

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

        // Optimistic updates
        optimisticEvents,
        setOptimisticEvents,
        clearOptimisticEvents,
        getEventCardStatus,

        // Global flag
        globalFlag,

        // Internal (for ClassboardRealtimeSync)
        setClassboardModel: setClassboardModelWrapper,
    };
}
