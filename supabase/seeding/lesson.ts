/**
 * Lesson & Event Seeding
 * 
 * Create lessons, events, and teacher-equipment relations
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
    studentPackages: any[],
): Promise<any[]> => {
    const lessonRecords = [];
    const eventRecords = [];

    for (const bk of bookings) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const teacherComms = teacherCommissions.filter((tc) => tc.teacher_id === teacher.id);
        if (teacherComms.length === 0) continue;

        const commission = teacherComms[0];
        const studentPkg = studentPackages.find((sp) => sp.id === bk.school_package_id);
        const schoolPkg = studentPkg ? packages.find((p) => p.id === studentPkg.school_package_id) : null;

        const lesson = {
            school_id: schoolId,
            teacher_id: teacher.id,
            booking_id: bk.id,
            commission_id: commission.id,
            status: "completed",
        };

        lessonRecords.push(lesson);

        const numEvents = faker.number.int({ min: 2, max: 3 });
        const baseDate = new Date();

        for (let i = 0; i < numEvents; i++) {
            const eventDate = new Date(baseDate);
            eventDate.setDate(eventDate.getDate() + i);

            eventRecords.push({
                school_id: schoolId,
                lesson_id: "",
                date: eventDate.toISOString(),
                duration: 60 + faker.number.int({ min: 0, max: 60 }),
                location: faker.location.city(),
                status: "completed",
                _lessonIndex: lessonRecords.length - 1,
                _packageCategory: schoolPkg?.category_equipment,
                _capacityEquipment: schoolPkg?.capacity_equipment,
            });
        }
    }

    const { data: lessons, error: lessonError } = await supabase.from("lesson").insert(lessonRecords).select();
    if (lessonError) throw lessonError;
    console.log(`✅ Created ${lessons.length} lessons (all COMPLETED)`);

    const eventsToInsert = eventRecords.map((evt) => {
        const { _lessonIndex, _packageCategory, _capacityEquipment, ...rest } = evt;
        return {
            ...rest,
            lesson_id: lessons[_lessonIndex]?.id || lessons[0].id,
        };
    });

    const { data: events, error: eventError } = await supabase.from("event").insert(eventsToInsert).select();
    if (eventError) throw eventError;
    console.log(`✅ Created ${events.length} events (all COMPLETED)`);

    return lessons;
};

export const createTeacherEquipmentRelations = async (teachers: any[], equipment: any[]): Promise<void> => {
    const relations = [];

    for (const teacher of teachers) {
        const numEquipment = faker.number.int({ min: 2, max: 3 });
        const assignedEquipment = equipment.sort(() => 0.5 - Math.random()).slice(0, numEquipment);

        for (const eq of assignedEquipment) {
            relations.push({
                teacher_id: teacher.id,
                equipment_id: eq.id,
                active: true,
            });
        }
    }

    const { error } = await supabase.from("teacher_equipment").insert(relations);
    if (error) throw error;
    console.log(`✅ Created ${relations.length} teacher-equipment relations`);
};
