import type { SchoolPackageType, StudentType, EventType } from "@/drizzle/schema";

export interface ClassboardBooking {
    id: string;
    dateStart: string;
    dateEnd: string;
    leaderStudentName?: string;
    status?: string;
}

export type ClassboardSchoolPackage = SchoolPackageType;

export type ClassboardStudent = Pick<StudentType, "id" | "firstName" | "lastName" | "passport" | "country" | "phone" | "languages">;

export interface ClassboardBookingStudent {
    student: ClassboardStudent & {
        description?: string | null; // from schoolStudents
    };
}

export interface ClassboardTeacher {
    id: string;
    username: string;
}

export type ClassboardEvent = Pick<EventType, "id" | "date" | "duration" | "location" | "status">;

export interface ClassboardCommission {
    id: string;
    type: "fixed" | "percentage";
    cph: string; // commission per hour
    description?: string | null;
}

export interface ClassboardLesson {
    id: string;
    teacher: ClassboardTeacher;
    status: string;
    commission: ClassboardCommission;
    events: ClassboardEvent[];
}

export interface ClassboardData {
    booking: ClassboardBooking;
    schoolPackage: ClassboardSchoolPackage;
    bookingStudents: ClassboardBookingStudent[];
    lessons: ClassboardLesson[];
}

export type ClassboardModel = ClassboardData[];
