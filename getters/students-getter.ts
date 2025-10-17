import type { StudentType } from "@/drizzle/schema";

export function getStudentName(student: StudentType): string {
    return student.name;
}

export function getStudentInfo(student: StudentType) {
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
