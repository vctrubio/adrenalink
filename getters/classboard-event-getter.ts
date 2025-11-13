import { createClassboardEvent } from "@/actions/classboard-action";
import type { ControllerSettings } from "@/backend/TeacherQueue";
import type { DraggableBooking } from "@/src/hooks/useClassboard";

export interface CreateEventForLessonParams {
    lessonId: string;
    eventDate: string;
    duration: number;
    location: string;
}

export interface FindLessonParams {
    booking: DraggableBooking;
    teacherUsername: string;
}

export interface CalculateEventTimeParams {
    booking: DraggableBooking;
    nextSlot: string;
    selectedDate: string;
    controller: ControllerSettings;
}

export interface CalculateEventTimeResult {
    eventDate: string;
    duration: number;
}

/**
 * Finds the lesson in a booking that matches a teacher username
 */
export function findLessonForTeacher({ booking, teacherUsername }: FindLessonParams) {
    return booking.lessons.find((l) => l.teacherUsername === teacherUsername);
}

/**
 * Calculates event date/time and duration based on next available slot and booking capacity
 */
export function calculateEventTime({
    booking,
    nextSlot,
    selectedDate,
    controller,
}: CalculateEventTimeParams): CalculateEventTimeResult {
    // Calculate event date/time
    const dateObj = new Date(selectedDate);
    const [hours, minutes] = nextSlot.split(":").map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    const eventDate = dateObj.toISOString();

    // Calculate duration based on capacity
    let duration: number;
    if (booking.capacityStudents === 1) {
        duration = controller.durationCapOne;
    } else if (booking.capacityStudents <= 3) {
        duration = controller.durationCapTwo;
    } else {
        duration = controller.durationCapThree;
    }

    return { eventDate, duration };
}

/**
 * Creates an event for a lesson via server action
 */
export async function createEventForLesson({
    lessonId,
    eventDate,
    duration,
    location,
}: CreateEventForLessonParams) {
    return await createClassboardEvent(lessonId, eventDate, duration, location);
}
