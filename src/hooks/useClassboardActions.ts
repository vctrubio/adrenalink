import { useCallback } from "react";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import { createClassboardEvent } from "@/actions/classboard-action";
import { createLesson } from "@/actions/lessons-action";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { DraggableBooking, EventNode } from "@/types/classboard-teacher-queue";
import type { TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";
import type { TeacherModel } from "@/backend/models";

interface UseClassboardActionsProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    controller: ControllerSettings;
    selectedDate: string;
    allSchoolTeachers: TeacherModel[];
    addOptimisticEvent: (event: EventNode, teacherUsername: string) => void;
}

export function useClassboardActions({
    globalFlag,
    teacherQueues,
    controller,
    selectedDate,
    allSchoolTeachers,
    addOptimisticEvent,
}: UseClassboardActionsProps) {

    const handleGlobalSubmit = useCallback(async () => {
        try {
            const allUpdates = globalFlag.collectChanges();

            if (allUpdates.length > 0) {
                const result = await bulkUpdateClassboardEvents(allUpdates);

                if (!result.success) {
                    console.error("Failed to update events:", result.error);
                    return;
                }
            }

            globalFlag.exitAdjustmentMode();
        } catch (error) {
            console.error("Error submitting global updates:", error);
        }
    }, [globalFlag]);

    const handleAddLessonEvent = useCallback(async (booking: DraggableBooking, teacherUsername: string) => {
        try {
            const lesson = booking.lessons.find((l) => l.teacherUsername === teacherUsername);
            const queue = teacherQueues.find((q) => q.teacher.username === teacherUsername);
            if (!lesson || !queue) return;

            const { time, duration } = queue.getInsertionTime(controller.submitTime, booking.capacityStudents, controller);
            
            // --- OPTIMISTIC UPDATE ---
            const eventDate = `${selectedDate}T${time}:00`;
            const tempId = `temp-${Date.now()}`;
            
            const optimisticEvent: EventNode = {
                id: tempId,
                lessonId: lesson.id,
                bookingId: booking.bookingId,
                leaderStudentName: "Posting...",
                bookingStudents: [],
                commission: { type: lesson.commissionType, cph: lesson.commissionCph },
                eventData: {
                    date: eventDate,
                    duration: duration,
                    location: controller.location,
                    status: "planned",
                },
                studentData: [],
                packageData: {
                    pricePerStudent: 0,
                    durationMinutes: 0,
                    description: "Loading...",
                    categoryEquipment: "",
                    capacityEquipment: 0
                },
                next: null
            };

            addOptimisticEvent(optimisticEvent, teacherUsername);

            // --- SERVER ACTION ---
            await createClassboardEvent(lesson.id, eventDate, duration, controller.location);
            
        } catch (error) {
            console.error("❌ [useClassboardActions] Error adding lesson event:", error);
        }
    }, [teacherQueues, controller, selectedDate, addOptimisticEvent]);

    const handleAddTeacher = useCallback(async (booking: DraggableBooking, teacherUsername: string) => {
        try {
            const teacherModel = allSchoolTeachers.find((t) => t.schema.username === teacherUsername);
            if (!teacherModel) return;

            const commission = teacherModel.relations?.commissions?.[0];
            if (!commission) {
                console.error("❌ [useClassboardActions] Teacher has no commission:", teacherUsername);
                return;
            }

            const result = await createLesson({
                bookingId: booking.bookingId,
                teacherId: teacherModel.schema.id,
                commissionId: commission.id,
                schoolId: teacherModel.schema.schoolId,
                status: "active",
            });

            if (!result.success) {
                console.error("❌ [useClassboardActions] Failed to create lesson:", result.error);
            }
        } catch (error) {
            console.error("❌ [useClassboardActions] Error adding teacher to booking:", error);
        }
    }, [allSchoolTeachers]);

    return {
        handleGlobalSubmit,
        handleAddLessonEvent,
        handleAddTeacher,
    };
}
