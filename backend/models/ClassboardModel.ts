import type { SchoolPackageType, StudentType, EventType } from "@/drizzle/schema";

export type ClassboardBooking = {
    dateStart: string;
    dateEnd: string;
    schoolId: string;
};

export type ClassboardSchoolPackage = SchoolPackageType;

export type ClassboardStudent = Pick<StudentType, "firstName" | "lastName">;

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

export function createClassboardModel(bookingsData: any[]): ClassboardModel {
    const result: ClassboardModel = {};

    for (const bookingData of bookingsData) {
        const { id, dateStart, dateEnd, schoolId, studentPackage, bookingStudents, lessons } = bookingData;

        result[id] = {
            booking: {
                dateStart,
                dateEnd,
                schoolId, //update: not needed, we fetch schoolID in the server. 
            },
            schoolPackage: studentPackage.schoolPackage,
            bookingStudents: bookingStudents.map((bs: any) => ({
                student: {
                    firstName: bs.student.firstName,
                    lastName: bs.student.lastName,
                    id: bs.student.id,
                },
            })),
            lessons: lessons.map((lesson: any) => ({
                id: lesson.id,
                teacher: {
                    username: lesson.teacher.username,
                    firstName: lesson.teacher.firstName,
                    lastName: lesson.teacher.lastName,
                },
                status: lesson.status,
                commission: {
                    id: lesson.commission.id,
                    type: lesson.commission.commissionType as "fixed" | "percentage",
                    cph: lesson.commission.cph,
                    description: lesson.commission.description,
                },
                events: lesson.events.map((event: any) => ({
                    id: event.id,
                    date: event.date,
                    duration: event.duration,
                    location: event.location,
                    status: event.status,
                })),
            })),
        };
    }

    return result;
}
