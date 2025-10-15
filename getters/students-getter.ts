import type { Student } from "@/drizzle/schema";

export function getStudentName(student: Student): string {
    return student.name;
}

export function getStudentInfo(student: Student) {
    return {
        id: student.id,
        name: student.name,
        passport: student.passport,
        country: student.country,
        phone: student.phone,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
    };
}