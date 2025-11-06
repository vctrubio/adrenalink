import type { SchoolPackageType, StudentPackageType, StudentType, TeacherType, EventType } from "@/drizzle/schema";

export type ClassboardBooking = {
    dateStart: string;
    dateEnd: string;
    schoolId: string;
};

export type ClassboardSchoolPackage = Pick<SchoolPackageType, "durationMinutes" | "description" | "pricePerStudent" | "capacityStudents" | "capacityEquipment" | "categoryEquipment" | "packageType">;

export type ClassboardStudent = Pick<StudentType, "firstName" | "lastName" | "passport" | "country" | "phone" | "languages">;

export type ClassboardBookingStudent = {
    student: ClassboardStudent;
};

export type ClassboardTeacher = Pick<TeacherType, "firstName" | "lastName" | "username">;

export type ClassboardEvent = Pick<EventType, "date" | "duration" | "location" | "status">;

export type ClassboardLesson = {
    teacher: ClassboardTeacher;
    events: ClassboardEvent[];
};

export type ClassboardData = {
    booking: ClassboardBooking;
    schoolPackage: ClassboardSchoolPackage;
    studentPackage: Omit<StudentPackageType, "id">;
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
                schoolId,
            },
            schoolPackage: {
                durationMinutes: studentPackage.schoolPackage.durationMinutes,
                description: studentPackage.schoolPackage.description,
                pricePerStudent: studentPackage.schoolPackage.pricePerStudent,
                capacityStudents: studentPackage.schoolPackage.capacityStudents,
                capacityEquipment: studentPackage.schoolPackage.capacityEquipment,
                categoryEquipment: studentPackage.schoolPackage.categoryEquipment,
                packageType: studentPackage.schoolPackage.packageType,
            },
            studentPackage: {
                studentId: studentPackage.studentId,
                packageId: studentPackage.packageId,
                referralId: studentPackage.referralId,
                requestedDateStart: studentPackage.requestedDateStart,
                requestedDateEnd: studentPackage.requestedDateEnd,
                status: studentPackage.status,
                createdAt: studentPackage.createdAt,
                updatedAt: studentPackage.updatedAt,
            },
            bookingStudents: bookingStudents.map((bs: any) => ({
                student: {
                    firstName: bs.student.firstName,
                    lastName: bs.student.lastName,
                    passport: bs.student.passport,
                    country: bs.student.country,
                    phone: bs.student.phone,
                    languages: bs.student.languages,
                },
            })),
            lessons: lessons.map((lesson: any) => ({
                teacher: {
                    firstName: lesson.teacher.firstName,
                    lastName: lesson.teacher.lastName,
                    username: lesson.teacher.username,
                },
                events: lesson.events.map((event: any) => ({
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
