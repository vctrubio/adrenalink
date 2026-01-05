import { calculateCommission, calculateLessonRevenue, calculateSchoolProfit } from "@/getters/commission-calculator";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import type { EventNode } from "@/backend/classboard/TeacherQueue";
import type { TeacherStats, DailyLessonStats } from "@/backend/classboard/ClassboardStatistics";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { TrendingUpDown, TrendingUp, TrendingDown } from "lucide-react";

export const DASHBOARD_STATS_CONFIG = {
    students: {
        label: "Students",
        Icon: HelmetIcon,
    },
    teachers: {
        label: "Teachers",
        Icon: HeadsetIcon,
    },
    events: {
        label: "Events",
        Icon: FlagIcon,
    },
    completed: {
        label: "Completed",
        Icon: FlagIcon,
    },
    duration: {
        label: "Duration",
        Icon: DurationIcon,
    },
    revenue: {
        label: "Revenue",
        Icon: TrendingUp,
    },
    commission: {
        label: "Comm.",
        Icon: HandshakeIcon,
    },
    profit: {
        label: "Profit",
        // Default icon, but we also provide a helper for dynamic icons
        Icon: TrendingUpDown,
        getIcon: (value: number) => (value > 0 ? TrendingUp : value < 0 ? TrendingDown : TrendingUpDown),
    },
} as const;

export type DashboardStatKey = keyof typeof DASHBOARD_STATS_CONFIG;

export const STATS_GROUP_TOP: DashboardStatKey[] = ["students", "teachers", "events"];
export const STATS_GROUP_BOTTOM: DashboardStatKey[] = ["duration", "commission", "profit"];
export const STATS_GROUP_REVENUE: DashboardStatKey[] = ["revenue", "commission", "profit"];

export type DisplayableStat = {
    key: DashboardStatKey;
    label: string;
    value: number;
    formatted: string;
    Icon: any;
    color?: string; // Optional color override or class
};

export function getDashboardStatsDisplay(stats: DailyLessonStats): Record<DashboardStatKey, DisplayableStat> {
    const profit = stats.revenue.profit;

    return {
        students: {
            key: "students",
            ...DASHBOARD_STATS_CONFIG.students,
            value: stats.studentCount,
            formatted: stats.studentCount.toString(),
        },
        teachers: {
            key: "teachers",
            ...DASHBOARD_STATS_CONFIG.teachers,
            value: stats.teacherCount,
            formatted: stats.teacherCount.toString(),
        },
        events: {
            key: "events",
            ...DASHBOARD_STATS_CONFIG.events,
            value: stats.eventCount,
            formatted: stats.eventCount.toString(),
        },
        completed: {
            key: "completed",
            ...DASHBOARD_STATS_CONFIG.completed,
            value: stats.eventCount, // Default to event count if not overridden
            formatted: stats.eventCount.toString(),
        },
        duration: {
            key: "duration",
            ...DASHBOARD_STATS_CONFIG.duration,
            value: stats.durationCount,
            formatted: getHMDuration(stats.durationCount),
        },
        revenue: {
            key: "revenue",
            ...DASHBOARD_STATS_CONFIG.revenue,
            value: stats.revenue.revenue,
            formatted: stats.revenue.revenue.toFixed(0),
        },
        commission: {
            key: "commission",
            ...DASHBOARD_STATS_CONFIG.commission,
            value: stats.revenue.commission,
            formatted: getCompactNumber(stats.revenue.commission),
        },
        profit: {
            key: "profit",
            ...DASHBOARD_STATS_CONFIG.profit,
            value: profit,
            formatted: getCompactNumber(profit),
            Icon: DASHBOARD_STATS_CONFIG.profit.getIcon(profit),
        },
    };
}

/**
 * Transforms raw database booking data into ClassboardModel format
 * This is a pure data transformation function - belongs in getters
 */
export function createClassboardModel(bookingsData: any[]): ClassboardModel {
    return bookingsData.map((bookingData) => {
        const { id, dateStart, dateEnd, schoolId, leaderStudentName, studentPackage, bookingStudents, lessons } = bookingData;

        return {
            booking: {
                id,
                dateStart,
                dateEnd,
                leaderStudentName,
            },
            schoolPackage: studentPackage.schoolPackage,
            bookingStudents: bookingStudents.map((bs: any) => {
                const schoolStudentsArray = bs.student.schoolStudents || [];
                const schoolStudent = schoolStudentsArray.find((ss: any) => ss.schoolId === schoolId);

                return {
                    student: {
                        id: bs.student.id,
                        firstName: bs.student.firstName,
                        lastName: bs.student.lastName,
                        passport: bs.student.passport || "",
                        country: bs.student.country || "",
                        phone: bs.student.phone || "",
                        languages: bs.student.languages || [],
                        description: schoolStudent?.description || null,
                    },
                };
            }),
            lessons: lessons.map((lesson: any) => ({
                id: lesson.id,
                teacher: lesson.teacher
                    ? {
                          id: lesson.teacher.id,
                          username: lesson.teacher.username,
                      }
                    : undefined,
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
    });
}
