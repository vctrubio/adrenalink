import type { SchoolType } from "@/drizzle/schema";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import { getTimeZoneLatLong } from "./timezone-getter";

export function getSchoolName(school: SchoolType): string {
    return `${school.name} @${school.username}`;
}

export function getSchoolInfo(school: SchoolType) {
    return {
        id: school.id,
        name: school.name,
        country: school.country,
        phone: school.phone,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
    };
}

export function getSchoolTimeZone(school: SchoolType): string | null {
    const latitude = school.latitude ? parseFloat(school.latitude) : null;
    const longitude = school.longitude ? parseFloat(school.longitude) : null;
    return getTimeZoneLatLong(latitude, longitude);
}

export function getSchoolStudentCount(school: SchoolModel): number {
    return school.relations?.schoolStudents?.length || 0;
}

export function getSchoolPackageCount(school: SchoolModel): number {
    return school.relations?.schoolPackages?.length || 0;
}

export function getSchoolTotalStudentRequests(school: SchoolModel): number {
    const packages = school.relations?.schoolPackages || [];
    return packages.reduce((acc: number, pkg: any) => acc + (pkg.studentPackages?.length || 0), 0);
}

export function getSchoolEquipmentList(school: SchoolType): string[] {
    return school.equipmentCategories ? school.equipmentCategories.split(",") : [];
}
