/**
 * Student Seeding
 *
 * Create student records and associate with schools
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

// Country to phone code mapping
const COUNTRY_CODES: Record<string, string> = {
    Spain: "+34",
    Germany: "+49",
    France: "+33",
    Italy: "+39",
    Netherlands: "+31",
    "United Kingdom": "+44",
    Portugal: "+351",
    Belgium: "+32",
    Austria: "+43",
    Greece: "+30",
    Poland: "+48",
    "Czech Republic": "+420",
    Hungary: "+36",
    Romania: "+40",
    Bulgaria: "+359",
    Croatia: "+385",
    Slovenia: "+386",
    Slovakia: "+421",
    Denmark: "+45",
    Sweden: "+46",
    Norway: "+47",
    Finland: "+358",
    Iceland: "+354",
};

const getCountryCode = (country: string): string => {
    return COUNTRY_CODES[country] || "+34"; // Default to Spain if unknown
};

export interface StudentInput {
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages?: string[];
}

export const createStudents = async (count = 8): Promise<any[]> => {
    const students = Array.from({ length: count }, () => {
        const country = faker.location.country();
        const countryCode = getCountryCode(country);
        const phoneNumber = faker.string.numeric(9);

        return {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            passport: faker.string.alphanumeric(10).toUpperCase(),
            country: country,
            phone: `${countryCode}${phoneNumber}`,
            languages: [faker.helpers.arrayElement(["English", "Spanish", "German", "French", "Italian", "Dutch"])],
        };
    });

    const { data, error } = await supabase.from("student").insert(students).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} students (with country phone codes)`);
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
