"use server";

import { db } from "@/drizzle/db";
import {
    school,
    student,
    schoolPackage,
    studentPackage,
    booking,
    teacher,
    teacherCommission,
    equipment,
    lesson,
    event,
    schoolStudents,
    referral,
    bookingStudent,
    equipmentEvent,
    equipmentRepair,
    studentLessonFeedback,
    rental,
    teacherEquipment,
    teacherLessonPayment,
} from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

const ENTITY_TABLE_MAP: Record<string, PgTable<any> | null> = {
    // From entities.ts
    "school": school,
    "student": student,
    "schoolPackage": schoolPackage,
    "studentPackage": studentPackage,
    "teacher": teacher,
    "commission": teacherCommission,
    "booking": booking,
    "lesson": lesson,
    "event": event,
    "equipment": equipment,
    "payment": teacherLessonPayment, // Updated from null
    "student_lesson_feedback": studentLessonFeedback,
    "userWallet": null, // No table in schema

    // From tables.ts (the new "hidden" entities)
    "school_students": schoolStudents,
    "referral": referral,
    "booking_student": bookingStudent,
    "equipment_event": equipmentEvent,
    "equipment_repair": equipmentRepair,
    "rental": rental,
    "teacher_equipment": teacherEquipment,
};

export async function getEntityCount(entityId: string): Promise<number> {
    try {
        const table = ENTITY_TABLE_MAP[entityId];

        if (!table) {
            return 0;
        }

        const result = await db.select({ count: sql<number>`count(*)` }).from(table);
        return Number(result[0].count);
    } catch (error) {
        console.error(`Error fetching count for entity ${entityId}:`, error);
        return 0;
    }
}
