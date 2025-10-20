import type { SchoolType } from "@/drizzle/schema";
import type { SchoolModel } from "@/backend/models/SchoolModel";

export function getSchoolName(school: SchoolType): string {
    return `${school.name} @${school.username}`;
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
