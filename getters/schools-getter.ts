import type { SchoolType } from "@/drizzle/schema";

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
