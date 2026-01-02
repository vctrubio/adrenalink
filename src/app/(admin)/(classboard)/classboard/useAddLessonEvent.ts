import { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { createClassboardEvent } from "@/actions/classboard-action";
import { TeacherQueueV2, type EventNodeV2 } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { Teacher } from "@/backend/teacher-types";

/**
 * createEventNode - Factory function to create EventNodeV2 from booking data
 */
function createEventNode(event: any, lesson: any, booking: ClassboardData): EventNodeV2 {
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

/**
 * useClassboardQueues - Consolidated hook for teacher queues and event creation
 * 
 * Builds teacher queues from bookings and provides event creation handler
 * Eliminates prop drilling and keeps related logic together
 * 
 * @param allSchoolTeachers - All teachers from school
 * @param bookingsForSelectedDate - Filtered bookings for current date
 * @returns {teacherQueues, handleAddLessonEvent}
 */
export function useClassboardQueues(
    allSchoolTeachers: Teacher[],
    bookingsForSelectedDate: ClassboardData[]
) {
    const { selectedDate, controller } = useClassboardContext();

    // Build teacher queues from bookings
    const teacherQueues = useMemo(() => {
        console.log("🔄 [useClassboardQueues] Building queues");
        
        const queues = new Map<string, TeacherQueueV2>();

        // Initialize queues for all active teachers
        const activeTeachers = allSchoolTeachers.filter((teacher) => teacher.schema.active);
        
        activeTeachers.forEach((teacher) => {
            queues.set(
                teacher.schema.id,
                new TeacherQueueV2({
                    id: teacher.schema.id,
                    username: teacher.schema.username,
                })
            );
        });

        // Populate queues with events from bookings
        bookingsForSelectedDate.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                const teacherId = lesson.teacher?.id;
                if (!teacherId) return;

                const queue = queues.get(teacherId);
                if (!queue) return;

                (lesson.events || []).forEach((event) => {
                    const eventNode = createEventNode(event, lesson, booking);
                    queue.constructEvents(eventNode);
                });
            });
        });

        // Return queues in teacher order
        return activeTeachers
            .map((teacher) => queues.get(teacher.schema.id))
            .filter((queue): queue is TeacherQueueV2 => queue !== undefined);
    }, [allSchoolTeachers, bookingsForSelectedDate]);

    // Event creation handler
    const handleAddLessonEvent = useCallback(
        async (lessonId: string, teacherId: string, capacityStudents: number) => {
            console.log("➕ [useClassboardQueues] Adding event for lesson:", lessonId);

            try {
                const queue = teacherQueues.find((q) => q.teacher.id === teacherId);
                if (!queue) {
                    console.error("❌ Teacher not found in queues. teacherId:", teacherId);
                    toast.error("Teacher not on board - cannot add lesson");
                    return;
                }

                // Calculate duration based on capacity
                const duration = 
                    capacityStudents === 1 ? controller.durationCapOne :
                    capacityStudents === 2 ? controller.durationCapTwo :
                    controller.durationCapThree;

                // Get next available slot
                const slotTime = queue.getNextAvailableSlot(
                    controller.submitTime,
                    duration,
                    controller.gapMinutes
                );

                const eventDate = `${selectedDate}T${slotTime}:00`;

                // Create event via server action
                const result = await createClassboardEvent(lessonId, eventDate, duration, controller.location);
                if (!result.success) {
                    console.error("❌ Server action failed:", result.error);
                    return;
                }

                console.log("✅ Event created, subscription will sync");

            } catch (error) {
                console.error("❌ Error adding event:", error);
            }
        },
        [selectedDate, teacherQueues, controller]
    );

    return {
        teacherQueues,
        handleAddLessonEvent,
    };
}
