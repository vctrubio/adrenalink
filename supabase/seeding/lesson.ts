/**
 * Lesson & Event Seeding (Fresh)
 *
 * Create lessons with one teacher per booking
 * Create events based on package duration dates
 * Add equipment through teacher_equipment relations
 * Create student feedback and all payments
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export const createLessonsAndEvents = async (
    bookings: any[],
    teachers: any[],
    teacherCommissions: any[],
    schoolId: string,
    packages: any[],
    equipment: any[],
    studentPackageMap: Map<string, string>,
): Promise<{ lessons: any[]; events: any[] }> => {
    const lessonRecords: any[] = [];
    const eventRecords: any[] = [];

    // Group bookings by date_start
    const bookingsByDate: Record<string, any[]> = {};
    for (const bk of bookings) {
        if (!bookingsByDate[bk.date_start]) bookingsByDate[bk.date_start] = [];
        bookingsByDate[bk.date_start].push(bk);
    }

    for (const dateStr of Object.keys(bookingsByDate)) {
        const dayBookings = bookingsByDate[dateStr];
        dayBookings.sort((a, b) => a.id.localeCompare(b.id));

        // Start at 09:00:00 Wall Clock Time
        let currentHour = 9;
        let currentMinute = 0;

        for (const bk of dayBookings) {
            // ... (teacher/package logic) ...
            const teacher = teachers[Math.floor(Math.random() * teachers.length)];
            const teacherComms = teacherCommissions.filter((tc) => tc.teacher_id === teacher.id);
            if (teacherComms.length === 0) continue;

            const commission = teacherComms[0];
            const schoolPkg = packages.find((p) => p.id === bk.school_package_id);
            if (!schoolPkg) continue;

            const lesson = {
                school_id: schoolId,
                teacher_id: teacher.id,
                booking_id: bk.id,
                commission_id: commission.id,
                status: "completed",
                _packageDuration: schoolPkg.duration_minutes,
                _capacityEquipment: schoolPkg.capacity_equipment,
                _categoryEquipment: schoolPkg.category_equipment,
            };

            lessonRecords.push(lesson);

            // Construct Wall Clock Time string manually: YYYY-MM-DDTHH:MM:SS
            const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`;
            const eventDateStr = `${dateStr}T${timeStr}`;
            const duration = schoolPkg.duration_minutes || 60;

            eventRecords.push({
                school_id: schoolId,
                lesson_id: "",
                date: eventDateStr, // Literal string, no timezone
                duration: duration,
                location: faker.location.city(),
                status: "completed",
                _lessonIndex: lessonRecords.length - 1,
                _capacityEquipment: schoolPkg.capacity_equipment,
            });

            // Increment time
            currentMinute += duration;
            while (currentMinute >= 60) {
                currentMinute -= 60;
                currentHour += 1;
            }
        }
    }

    // Insert lessons
    const lessonsToInsert = lessonRecords.map((l) => {
        const { _packageDuration, _capacityEquipment, _categoryEquipment, ...rest } = l;
        return rest;
    });

    const { data: lessons, error: lessonError } = await supabase.from("lesson").insert(lessonsToInsert).select();
    if (lessonError) throw lessonError;
    console.log(`✅ Created ${lessons.length} lessons (all COMPLETED)`);

    // Insert events
    const eventsToInsert = eventRecords.map((evt) => {
        const { _lessonIndex, _capacityEquipment, ...rest } = evt;
        return {
            ...rest,
            lesson_id: lessons[_lessonIndex]?.id || lessons[0].id,
        };
    });

    const { data: events, error: eventError } = await supabase.from("event").insert(eventsToInsert).select();
    if (eventError) throw eventError;
    console.log(`✅ Created ${events.length} events (all COMPLETED)`);

    return { lessons, events };
};

/**
 * Add equipment to events via equipment_event join table
 * Uses teacher_equipment relations to find available equipment
 */
export const addEquipmentToEvents = async (
    events: any[],
    lessons: any[],
    teachers: any[],
    teacherEquipment: Map<string, string[]>, // teacher_id -> [equipment_ids]
): Promise<void> => {
    const equipmentEventRecords: any[] = [];

    for (const event of events) {
        const lesson = lessons.find((l) => l.id === event.lesson_id);
        if (!lesson) continue;

        const requiredCategory = lesson._categoryEquipment;
        const teacherEquipmentIds = teacherEquipment.get(lesson.teacher_id) || [];
        if (teacherEquipmentIds.length === 0) continue;

        // Filter teacher's equipment by required category
        const teacherEquipmentByCategory = lesson.teacher_equipment_details
            ? lesson.teacher_equipment_details.filter((eq: any) => eq.category === requiredCategory)
            : [];

        // Fallback: if no details, just use all teacher equipment
        const eligibleEquipmentIds = teacherEquipmentByCategory.length > 0
            ? teacherEquipmentByCategory.map((eq: any) => eq.id)
            : teacherEquipmentIds;

        // Add up to 2 equipment items per event, matching category
        const numEquipment = Math.min(2, eligibleEquipmentIds.length);
        for (let i = 0; i < numEquipment; i++) {
            equipmentEventRecords.push({
                equipment_id: eligibleEquipmentIds[i],
                event_id: event.id,
            });
        }
    }

    if (equipmentEventRecords.length === 0) return;

    const { error } = await supabase.from("equipment_event").insert(equipmentEventRecords);
    if (error) throw error;
    console.log(`✅ Added ${equipmentEventRecords.length} equipment items to events`);
};

/**
 * Create student feedback for completed lessons
 */
export const createStudentLessonFeedback = async (
    bookings: any[],
    lessons: any[],
    bookingStudents: Map<string, string[]>,
): Promise<void> => {
    const feedbackRecords: any[] = [];

    for (const lesson of lessons) {
        const booking = bookings.find((b) => b.id === lesson.booking_id);
        if (!booking) continue;

        const studentIds = bookingStudents.get(booking.id) || [];
        for (const studentId of studentIds) {
            feedbackRecords.push({
                student_id: studentId,
                lesson_id: lesson.id,
                feedback: faker.lorem.sentence(),
            });
        }
    }

    if (feedbackRecords.length === 0) return;

    const { error } = await supabase.from("student_lesson_feedback").insert(feedbackRecords);
    if (error) throw error;
    console.log(`✅ Created ${feedbackRecords.length} student lesson feedbacks`);
};
