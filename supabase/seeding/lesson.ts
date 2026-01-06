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
    studentPackageMap: Map<string, string>
): Promise<{ lessons: any[]; events: any[] }> => {
    const lessonRecords: any[] = [];
    const eventRecords: any[] = [];

    for (const bk of bookings) {
        // One teacher per booking
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

        // Create one event from booking date + package duration
        const bookingDate = new Date(bk.date_start + "T09:00:00Z");
        const duration = schoolPkg.duration_minutes || 60;

        eventRecords.push({
            school_id: schoolId,
            lesson_id: "", // Will be filled after lessons created
            date: bookingDate.toISOString(),
            duration: duration,
            location: faker.location.city(),
            status: "completed",
            _lessonIndex: lessonRecords.length - 1,
            _capacityEquipment: schoolPkg.capacity_equipment,
        });
    }

    // Insert lessons
    const lessonsToInsert = lessonRecords.map((l) => {
        const { _packageDuration, _capacityEquipment, _categoryEquipment, ...rest } = l;
        return rest;
    });

    const { data: lessons, error: lessonError } = await supabase
        .from("lesson")
        .insert(lessonsToInsert)
        .select();
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

    const { data: events, error: eventError } = await supabase
        .from("event")
        .insert(eventsToInsert)
        .select();
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
    teacherEquipment: Map<string, string[]> // teacher_id -> [equipment_ids]
): Promise<void> => {
    const equipmentEventRecords: any[] = [];

    for (const event of events) {
        const lesson = lessons.find((l) => l.id === event.lesson_id);
        if (!lesson) continue;

        const teacherEquipmentIds = teacherEquipment.get(lesson.teacher_id) || [];
        if (teacherEquipmentIds.length === 0) continue;

        // Add up to 2 equipment items per event
        const numEquipment = Math.min(2, teacherEquipmentIds.length);
        for (let i = 0; i < numEquipment; i++) {
            equipmentEventRecords.push({
                equipment_id: teacherEquipmentIds[i],
                event_id: event.id,
            });
        }
    }

    if (equipmentEventRecords.length === 0) return;

    const { error } = await supabase
        .from("equipment_event")
        .insert(equipmentEventRecords);
    if (error) throw error;
    console.log(`✅ Added ${equipmentEventRecords.length} equipment items to events`);
};

/**
 * Create student feedback for completed lessons
 */
export const createStudentLessonFeedback = async (
    bookings: any[],
    lessons: any[],
    bookingStudents: Map<string, string[]>
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

    const { error } = await supabase
        .from("student_lesson_feedback")
        .insert(feedbackRecords);
    if (error) throw error;
    console.log(`✅ Created ${feedbackRecords.length} student lesson feedbacks`);
};
