import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import { ClassboardStatistics } from "@/backend/classboard/ClassboardStatistics";
import type { TransactionEventData } from "@/types/transaction-event";
import type { DateGroup, TransactionEvent, HomeStats } from "./HomePage";

export function getHomeStats(classboardData: ClassboardModel): HomeStats {
    const stats = new ClassboardStatistics(classboardData, undefined, true).getDailyLessonStats();
    return {
        duration: stats.durationCount,
        commissions: stats.revenue.commission,
        profit: stats.revenue.profit,
        events: stats.eventCount,
    };
}

export function getGroupedEvents(classboardData: ClassboardModel): DateGroup[] {
    const groups: Record<string, DateGroup> = {};

    Object.values(classboardData).forEach((booking) => {
        const leaderStudent = booking.bookingStudents[0]?.student;
        const leaderStudentName = leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "Unknown";

        booking.lessons.forEach((lesson) => {
            lesson.events.forEach((event) => {
                const dateKey = event.date.split("T")[0];

                if (!groups[dateKey]) {
                    groups[dateKey] = {
                        date: dateKey,
                        events: [],
                    };
                }

                groups[dateKey].events.push({
                    id: event.id,
                    date: event.date,
                    lessonId: event.lessonId,
                    location: event.location,
                    duration: event.duration,
                    status: event.status,
                    teacherUsername: lesson.teacher.username,
                    packageName: booking.schoolPackage.description,
                    leaderStudentName,
                    categoryEquipment: booking.schoolPackage.categoryEquipment,
                    capacityEquipment: booking.schoolPackage.capacityEquipment,
                    capacityStudents: booking.schoolPackage.capacityStudents,
                    packageDurationMinutes: booking.schoolPackage.durationMinutes,
                    pricePerStudent: booking.schoolPackage.pricePerStudent,
                    equipments: (event as any).equipments || [],
                });
            });
        });
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllTransactionEvents(classboardData: ClassboardModel, currency: string): TransactionEventData[] {
    const events: TransactionEventData[] = [];

    Object.values(classboardData).forEach((booking) => {
        const { bookingStudents, lessons, schoolPackage } = booking;
        const leaderStudent = bookingStudents[0]?.student;
        const leaderStudentName = leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "Unknown";
        const studentCount = bookingStudents.length;
        const studentNames = bookingStudents.map((bs) => `${bs.student.firstName} ${bs.student.lastName}`);

        lessons.forEach((lesson) => {
            lesson.events.forEach((event) => {
                const durationHours = event.duration / 60;
                const studentRevenue = schoolPackage.pricePerStudent * durationHours * studentCount;
                const cph = parseFloat(lesson.commission.cph) || 0;

                let teacherEarnings = 0;
                if (lesson.commission.type === "fixed") {
                    teacherEarnings = cph * durationHours;
                } else {
                    teacherEarnings = studentRevenue * (cph / 100);
                }

                events.push({
                    event: {
                        id: event.id,
                        date: event.date,
                        duration: event.duration,
                        location: event.location,
                        status: event.status,
                    },
                    teacher: {
                        id: lesson.teacher.id,
                        username: lesson.teacher.username,
                    },
                    leaderStudentName,
                    studentCount,
                    studentNames,
                    packageData: {
                        description: schoolPackage.description,
                        pricePerStudent: schoolPackage.pricePerStudent,
                        durationMinutes: schoolPackage.durationMinutes,
                        categoryEquipment: schoolPackage.categoryEquipment,
                        capacityEquipment: schoolPackage.capacityEquipment,
                        capacityStudents: schoolPackage.capacityStudents,
                    },
                    financials: {
                        teacherEarnings,
                        studentRevenue,
                        profit: studentRevenue - teacherEarnings,
                        currency: currency,
                        commissionType: lesson.commission.type as "fixed" | "percentage",
                        commissionValue: cph,
                    },
                    equipments: (event as any).equipments || [],
                });
            });
        });
    });

    return events.sort((a, b) => b.event.date.localeCompare(a.event.date));
}
