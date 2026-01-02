"use client";

import { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useClassboardContext } from "./classboard-provider";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { createClassboardEvent } from "@/actions/classboard-action";
import { TeacherQueue, type EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";

/**
 * createEventNode - Factory function to create EventNode from booking data
 */
function createEventNode(event: any, lesson: any, booking: ClassboardData): EventNode {
    return {
        id: event.id,
        lessonId: lesson.id,
        bookingId: booking.booking.id,
        bookingLeaderName: booking.booking.leaderStudentName,
        bookingStudents: booking.bookingStudents.map((bs) => ({
            id: bs.student.id,
            firstName: bs.student.firstName,
            lastName: bs.student.lastName,
            passport: bs.student.passport,
            country: bs.student.country,
            phone: bs.student.phone,
        })),
        capacityStudents: booking.schoolPackage.capacityStudents,
        pricePerStudent: booking.schoolPackage.pricePerStudent,
        categoryEquipment: booking.schoolPackage.categoryEquipment,
        capacityEquipment: booking.schoolPackage.capacityEquipment,
        commission: {
            type: lesson.commission.type,
            cph: parseFloat(lesson.commission.cph),
        },
        eventData: {
            date: event.date,
            duration: event.duration,
            location: event.location,
            status: event.status,
        },
        next: null,
    };
}

interface ClassboardActionsContextType {
    teacherQueues: TeacherQueue[];
    draggedBooking: DraggableBooking | null;
    setDraggedBooking: (booking: DraggableBooking | null) => void;
    addLessonEvent: (bookingData: ClassboardData, lessonId: string) => Promise<void>;
    optimisticEvents: Map<string, OptimisticEvent>;
    clearOptimisticEvents: () => void;
    globalFlag: GlobalFlag;
}

const ClassboardActionsContext = createContext<ClassboardActionsContextType | undefined>(undefined);

interface ClassboardActionsProviderProps {
    children: ReactNode;
}

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
    categoryEquipment: string;
    capacityEquipment: number;
    commission: {
        type: string;
        cph: number;
    };
    date: string;
    duration: number;
    location: string;
}

/**
 * Convert OptimisticEvent to EventNode for rendering
 */
export function optimisticEventToNode(event: OptimisticEvent): EventNode {
    return {
        id: event.id,
        lessonId: event.lessonId,
        bookingId: event.bookingId,
        bookingLeaderName: event.bookingLeaderName,
        bookingStudents: event.bookingStudents,
        capacityStudents: event.capacityStudents,
        pricePerStudent: event.pricePerStudent,
        categoryEquipment: event.categoryEquipment,
        capacityEquipment: event.capacityEquipment,
        commission: event.commission,
        eventData: {
            date: event.date,
            duration: event.duration,
            location: event.location,
            status: "planned", // Optimistic events are always "planned" status
        },
        next: null,
    };
}

export function ClassboardActionsProvider({ children }: ClassboardActionsProviderProps) {
    const { selectedDate, controller, bookingsForSelectedDate } = useClassboardContext();
    const { teachers: allSchoolTeachers } = useSchoolTeachers();
    const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
    const [optimisticEvents, setOptimisticEvents] = useState<Map<string, OptimisticEvent>>(new Map());
    const [flagTick, setFlagTick] = useState(0);


    // Build teacher queues from bookings
    const teacherQueues = useMemo(() => {
        console.log("🔄 [ClassboardActionsProvider] Building queues");

        const queues = new Map<string, TeacherQueue>();

        // Initialize queues for all active teachers
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);

        activeTeachers.forEach((teacher) => {
            queues.set(
                teacher.schema.id,
                new TeacherQueue({
                    id: teacher.schema.id,
                    username: teacher.schema.username,
                }),
            );
        });

        // Populate queues with events from bookings
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId) return;

                const queue = queues.get(teacherId);
                if (!queue) return;

                // Sort events by start time to ensure correct insertion order
                const sortedEvents = (lesson.events || []).sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                sortedEvents.forEach((event) => {
                    const eventNode = createEventNode(event, lesson, booking);
                    queue.constructEvents(eventNode);
                });
            });
        });

        // Return queues in teacher order
        return activeTeachers.map((teacher) => queues.get(teacher.schema.id)).filter((queue): queue is TeacherQueue => queue !== undefined);
    }, [allSchoolTeachers, bookingsForSelectedDate]);

    // Instantiate GlobalFlag once
    const globalFlag = useMemo(() => {
        return new GlobalFlag(teacherQueues, controller, () => setFlagTick(t => t + 1));
    }, []); // Created once, dependencies handled by updates

    // Sync GlobalFlag with latest data
    useEffect(() => {
        globalFlag.updateTeacherQueues(teacherQueues);
        globalFlag.updateController(controller);
    }, [teacherQueues, controller, globalFlag]);

    // Event creation handler - takes bookingData and lessonId, figures out the rest
    const addLessonEvent = useCallback(
        async (bookingData: ClassboardData, lessonId: string) => {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            try {
                // Find lesson in booking
                const lesson = bookingData.lessons.find((l) => l.id === lessonId);
                if (!lesson?.teacher) {
                    console.error("❌ Lesson or teacher not found");
                    toast.error("Teacher not found for this lesson");
                    return;
                }

                // Find teacher queue
                const queue = teacherQueues.find((q) => q.teacher.id === lesson.teacher.id);
                if (!queue) {
                    console.error("❌ Teacher not on board:", lesson.teacher.username);
                    toast.error(`${lesson.teacher.username} is not on board today`);
                    return;
                }

                // Calculate duration based on capacity
                const capacityStudents = bookingData.schoolPackage.capacityStudents;
                const duration = capacityStudents === 1 ? controller.durationCapOne : capacityStudents === 2 ? controller.durationCapTwo : controller.durationCapThree;

                // Get next available slot
                const slotTime = queue.getNextAvailableSlot(controller.submitTime, duration, controller.gapMinutes);

                const eventDate = `${selectedDate}T${slotTime}:00`;

                // Add optimistic event with full booking data
                const optimisticEvent: OptimisticEvent = {
                    id: tempId,
                    lessonId,
                    teacherId: lesson.teacher.id,
                    bookingId: bookingData.booking.id,
                    bookingLeaderName: bookingData.booking.leaderStudentName,
                    bookingStudents: bookingData.bookingStudents.map((bs) => ({
                        id: bs.student.id,
                        firstName: bs.student.firstName,
                        lastName: bs.student.lastName,
                        passport: bs.student.passport,
                        country: bs.student.country,
                        phone: bs.student.phone,
                    })),
                    capacityStudents: bookingData.schoolPackage.capacityStudents,
                    pricePerStudent: bookingData.schoolPackage.pricePerStudent,
                    categoryEquipment: bookingData.schoolPackage.categoryEquipment,
                    capacityEquipment: bookingData.schoolPackage.capacityEquipment,
                    commission: {
                        type: lesson.commission.type,
                        cph: parseFloat(lesson.commission.cph),
                    },
                    date: eventDate,
                    duration,
                    location: controller.location,
                };

                setOptimisticEvents((prev) => new Map(prev).set(tempId, optimisticEvent));

                // Create event via server action
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);

                if (!result.success) {
                    console.error("❌ Failed to create event:", result.error);
                    // Remove optimistic event on failure
                    setOptimisticEvents((prev) => {
                        const updated = new Map(prev);
                        updated.delete(tempId);
                        return updated;
                    });
                    toast.error("Failed to create event");
                    return;
                }

                // Success - Keep optimistic event, subscription will deliver real event
                // The optimistic event will be removed when real event appears
                console.log("✅ Event created, waiting for subscription");
            } catch (error) {
                console.error("❌ Error adding event:", error);
                // Remove optimistic event on error
                setOptimisticEvents((prev) => {
                    const updated = new Map(prev);
                    updated.delete(tempId);
                    return updated;
                });
                toast.error("Error creating event");
            }
        },
        [selectedDate, teacherQueues, controller],
    );

    // Clear all optimistic events - called by subscription handler for atomic cleanup
    const clearOptimisticEvents = useCallback(() => {
        setOptimisticEvents(new Map());
    }, []);

    return (
        <ClassboardActionsContext.Provider
            value={{
                teacherQueues,
                draggedBooking,
                setDraggedBooking,
                addLessonEvent,
                optimisticEvents,
                clearOptimisticEvents,
                globalFlag,
            }}
        >
            {children}
        </ClassboardActionsContext.Provider>
    );
}

export function useClassboardActions(): ClassboardActionsContextType {
    const context = useContext(ClassboardActionsContext);
    if (!context) {
        throw new Error("useClassboardActions must be used within ClassboardActionsProvider");
    }
    return context;
}
