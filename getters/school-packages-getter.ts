import type { SchoolPackageModel } from "@/backend/models/SchoolPackageModel";
import type { ClassboardLesson } from "@/backend/classboard/ClassboardModel";

export interface PackageInfo {
    pricePerStudent: number;
    durationMinutes: number;
    durationHours: number;
    pricePerHour: number;
    eventMinutes: number;
    eventHours: number;
    totalEvents: number;
}

export function getDurationHours(schoolPackage: SchoolPackageModel): number {
    return schoolPackage.schema.durationMinutes / 60;
}

export function getRevenue(schoolPackage: SchoolPackageModel): number {
    const studentPackages = schoolPackage.relations?.studentPackages || [];
    return studentPackages.length * schoolPackage.schema.pricePerStudent;
}

export function getStudentPricePerHour(schoolPackage: SchoolPackageModel): number {
    const hours = getDurationHours(schoolPackage);
    return hours > 0 ? schoolPackage.schema.pricePerStudent / hours : 0;
}

export function getRevenuePerHour(schoolPackage: SchoolPackageModel): number {
    const hours = getDurationHours(schoolPackage);
    const revenue = getRevenue(schoolPackage);
    return hours > 0 ? revenue / hours : 0;
}

export function getPricePerMinute(pricePerStudent: number, durationMinutes: number): number {
    return durationMinutes > 0 ? pricePerStudent / durationMinutes : 0;
}

export function getPackageInfo(
    schoolPackage: { pricePerStudent: number; durationMinutes: number },
    lessons: ClassboardLesson[],
): PackageInfo {
    const durationMinutes = schoolPackage.durationMinutes;
    const pricePerStudent = schoolPackage.pricePerStudent;
    const durationHours = durationMinutes > 0 ? durationMinutes / 60 : 0;
    const pricePerHour = durationHours > 0 ? pricePerStudent / durationHours : 0;

    const allEvents = lessons.flatMap((lesson) => lesson.events);
    const eventMinutes = allEvents.reduce((sum, e) => sum + e.duration, 0);
    const eventHours = Math.round((eventMinutes / 60) * 10) / 10;

    return {
        pricePerStudent,
        durationMinutes,
        durationHours,
        pricePerHour,
        eventMinutes,
        eventHours,
        totalEvents: allEvents.length,
    };
}

export function getPackageRevenue(totalHours: number, capacityStudents: number, pricePerStudent: number): number {
    return totalHours * capacityStudents * pricePerStudent;
}
