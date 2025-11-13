"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { student, teacher } from "@/drizzle/schema";
import type { ApiActionResponseModel } from "@/types/actions";

export interface StudentPackageBookingLessons {
    id: string;
    firstName: string;
    lastName: string;
    lessons: Array<{
        id: string;
        teacherUsername: string;
        teacherName: string;
        status: string;
        commission: {
            type: string;
            cph: number;
        };
        events: Array<{
            id: string;
            date: string;
            duration: number;
            location: string;
            status: string;
        }>;
        booking: {
            id: string;
            dateStart: string;
            dateEnd: string;
            schoolId: string;
        };
        schoolPackage: {
            id: string;
            name: string;
            capacityStudents: number;
            pricePerStudent: number;
            durationMinutes: number;
        };
    }>;
}

export interface TeacherPackageBookingLessons {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    lessons: Array<{
        id: string;
        status: string;
        commission: {
            type: string;
            cph: number;
        };
        events: Array<{
            id: string;
            date: string;
            duration: number;
            location: string;
            status: string;
        }>;
        booking: {
            id: string;
            dateStart: string;
            dateEnd: string;
            schoolId: string;
        };
        schoolPackage: {
            id: string;
            name: string;
            capacityStudents: number;
            pricePerStudent: number;
            durationMinutes: number;
        };
        studentNames: string[];
    }>;
}

export async function getStudentPackageBookingLessons(studentId: string): Promise<ApiActionResponseModel<StudentPackageBookingLessons>> {
    try {
        const studentData = await db.query.student.findFirst({
            where: eq(student.id, studentId),
            with: {
                bookingStudents: {
                    with: {
                        booking: {
                            with: {
                                studentPackage: {
                                    with: {
                                        schoolPackage: true,
                                    },
                                },
                                lessons: {
                                    with: {
                                        teacher: true,
                                        commission: true,
                                        events: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!studentData) {
            return { success: false, error: "Student not found" };
        }

        // Flatten and organize lessons with booking and package info
        const lessons: StudentPackageBookingLessons["lessons"] = [];

        studentData.bookingStudents.forEach((bs) => {
            const booking = bs.booking;
            bs.booking.lessons.forEach((lesson) => {
                lessons.push({
                    id: lesson.id,
                    teacherUsername: lesson.teacher.username,
                    teacherName: `${lesson.teacher.firstName} ${lesson.teacher.lastName}`,
                    status: lesson.status,
                    commission: {
                        type: lesson.commission?.type || "fixed",
                        cph: parseFloat(lesson.commission?.cph || "0"),
                    },
                    events: lesson.events.map((e) => ({
                        id: e.id,
                        date: e.date.toISOString(),
                        duration: e.duration,
                        location: e.location || "",
                        status: e.status,
                    })),
                    booking: {
                        id: booking.id,
                        dateStart: new Date(booking.dateStart).toISOString(),
                        dateEnd: new Date(booking.dateEnd).toISOString(),
                        schoolId: booking.schoolId,
                    },
                    schoolPackage: {
                        id: booking.studentPackage.schoolPackage.id,
                        name: booking.studentPackage.schoolPackage.name,
                        capacityStudents: booking.studentPackage.schoolPackage.capacityStudents,
                        pricePerStudent: parseFloat(booking.studentPackage.schoolPackage.pricePerStudent),
                        durationMinutes: booking.studentPackage.schoolPackage.durationMinutes,
                    },
                });
            });
        });

        const result: StudentPackageBookingLessons = {
            id: studentData.id,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            lessons,
        };

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching student lessons:", error);
        return { success: false, error: "Failed to fetch student lessons" };
    }
}

export async function getTeacherPackageBookingLessons(teacherId: string): Promise<ApiActionResponseModel<TeacherPackageBookingLessons>> {
    try {
        const teacherData = await db.query.teacher.findFirst({
            where: eq(teacher.id, teacherId),
            with: {
                lessons: {
                    with: {
                        commission: true,
                        events: true,
                        booking: {
                            with: {
                                studentPackage: {
                                    with: {
                                        schoolPackage: true,
                                    },
                                },
                                bookingStudents: {
                                    with: {
                                        student: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!teacherData) {
            return { success: false, error: "Teacher not found" };
        }

        // Organize lessons with booking info
        const lessons: TeacherPackageBookingLessons["lessons"] = teacherData.lessons.map((lesson) => ({
            id: lesson.id,
            status: lesson.status,
            commission: {
                type: lesson.commission?.type || "fixed",
                cph: parseFloat(lesson.commission?.cph || "0"),
            },
            events: lesson.events.map((e) => ({
                id: e.id,
                date: e.date.toISOString(),
                duration: e.duration,
                location: e.location || "",
                status: e.status,
            })),
            booking: {
                id: lesson.booking.id,
                dateStart: new Date(lesson.booking.dateStart).toISOString(),
                dateEnd: new Date(lesson.booking.dateEnd).toISOString(),
                schoolId: lesson.booking.schoolId,
            },
            schoolPackage: {
                id: lesson.booking.studentPackage.schoolPackage.id,
                name: lesson.booking.studentPackage.schoolPackage.name,
                capacityStudents: lesson.booking.studentPackage.schoolPackage.capacityStudents,
                pricePerStudent: parseFloat(lesson.booking.studentPackage.schoolPackage.pricePerStudent),
                durationMinutes: lesson.booking.studentPackage.schoolPackage.durationMinutes,
            },
            studentNames: lesson.booking.bookingStudents.map((bs) => `${bs.student.firstName} ${bs.student.lastName}`),
        }));

        const result: TeacherPackageBookingLessons = {
            id: teacherData.id,
            username: teacherData.username,
            firstName: teacherData.firstName,
            lastName: teacherData.lastName,
            lessons,
        };

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching teacher lessons:", error);
        return { success: false, error: "Failed to fetch teacher lessons" };
    }
}
