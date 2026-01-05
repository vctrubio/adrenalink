/**
 * Student Seeding
 * 
 * Create student records and associate with schools
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export interface StudentInput {
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages?: string[];
}

export const createStudents = async (count = 8): Promise<any[]> => {
    const students = Array.from({ length: count }, () => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        passport: faker.string.alphanumeric(10).toUpperCase(),
        country: faker.location.country(),
        phone: faker.string.numeric(10),
        languages: [faker.helpers.arrayElement(["English", "Spanish", "German", "French", "Italian", "Dutch"])],
    }));

    const { data, error } = await supabase.from("student").insert(students).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} students`);
    return data;
};

export const createStudentsManual = async (students: StudentInput[]): Promise<any[]> => {
    const { data, error } = await supabase
        .from("student")
        .insert(
            students.map((s) => ({
                ...s,
                languages: s.languages || ["English"],
            })),
        )
        .select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} students (manual)`);
    return data;
};

export const associateStudentsWithSchool = async (schoolId: string, students: any[]): Promise<void> => {
    const relations = students.map((student) => ({
        school_id: schoolId,
        student_id: student.id,
        description: faker.lorem.sentence(),
        active: true,
        rental: true,
    }));

    const { error } = await supabase.from("school_students").insert(relations);
    if (error) throw error;
    console.log(`✅ Associated ${students.length} students with school`);
};
