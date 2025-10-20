import type { SchoolPackageModel } from "@/backend/models/SchoolPackageModel";

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
