import type { SchoolPackageType, StudentType, EventType } from "@/drizzle/schema";

export type ClassboardBooking = {
    dateStart: string;
    dateEnd: string;
    schoolId: string;
};

export type ClassboardSchoolPackage = SchoolPackageType;

export type ClassboardStudent = Pick<StudentType, "id" | "firstName" | "lastName" | "passport" | "country" | "phone">;

export type ClassboardBookingStudent = {
    student: ClassboardStudent;
};

export type ClassboardTeacher = {
    username: string;
    firstName: string;
    lastName: string;
};

export type ClassboardEvent = Pick<EventType, "id" | "date" | "duration" | "location" | "status">;

export type ClassboardCommission = {
    id: string;
    type: "fixed" | "percentage";
    cph: string; // commission per hour
    description?: string | null;
};

export type ClassboardLesson = {
    id: string;
    teacher: ClassboardTeacher;
    status: string;
    commission: ClassboardCommission;
    events: ClassboardEvent[];
};

export type ClassboardData = {
    booking: ClassboardBooking;
    schoolPackage: ClassboardSchoolPackage;
    bookingStudents: ClassboardBookingStudent[];
    lessons: ClassboardLesson[];
};

export type ClassboardModel = Record<string, ClassboardData>;
