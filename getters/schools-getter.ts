import type { School } from "@/drizzle/schema";

export function getSchoolName(school: School): string {
    return school.name;
}

export function getSchoolInfo(school: School) {
    return {
        id: school.id,
        name: school.name,
        country: school.country,
        phone: school.phone,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
    };
}
