/**
 * Teacher Seeding
 * 
 * Create teacher records for a school
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export interface TeacherInput {
    first_name: string;
    last_name: string;
    username: string;
    passport: string;
    country: string;
    phone: string;
    languages?: string[];
}

export const createTeachers = async (schoolId: string, count = 2): Promise<any[]> => {
    const teachers = Array.from({ length: count }, () => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        username: faker.internet.username().toLowerCase(),
        passport: faker.string.alphanumeric(10).toUpperCase(),
        country: faker.location.country(),
        phone: faker.string.numeric(10),
        school_id: schoolId,
        languages: [faker.helpers.arrayElement(["Portuguese", "English", "Spanish", "French", "German"])],
        active: true,
    }));

    const { data, error } = await supabase.from("teacher").insert(teachers).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} teachers for school ${schoolId.substring(0, 8)}`);
    return data;
};

export const createTeachersManual = async (schoolId: string, teachers: TeacherInput[]): Promise<any[]> => {
    const { data, error } = await supabase
        .from("teacher")
        .insert(
            teachers.map((t) => ({
                ...t,
                school_id: schoolId,
                languages: t.languages || ["English"],
                active: true,
            })),
        )
        .select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} teachers (manual) for school ${schoolId.substring(0, 8)}`);
    return data;
};
