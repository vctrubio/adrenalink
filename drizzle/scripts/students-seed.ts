import { config } from "dotenv";
import { faker } from "@faker-js/faker";
import { db } from "../db";
import { student, school, schoolStudents } from "../schema";

config({ path: ".env.local" });

const STUDENT_COUNT = 5;
const SCHOOL_COUNT = 3;

// Country codes for phone numbers
const countryCodes = {
    "United States": "+1",
    Canada: "+1",
    "United Kingdom": "+44",
    France: "+33",
    Germany: "+49",
    Spain: "+34",
    Italy: "+39",
    Australia: "+61",
    Japan: "+81",
    Brazil: "+55",
};

function getRandomCountry() {
    const countries = Object.keys(countryCodes);
    return faker.helpers.arrayElement(countries);
}

function generatePhoneNumber(country: string) {
    const countryCode = countryCodes[country as keyof typeof countryCodes];
    const localNumber = faker.phone.number({ style: "national" }).replace(/\D/g, "").slice(0, 10);
    return `${countryCode}${localNumber}`;
}

function generateStudentData() {
    return Array.from({ length: STUDENT_COUNT }, () => {
        const country = getRandomCountry();
        return {
            name: faker.person.fullName(),
            passport: faker.string.alphanumeric({ length: 8, casing: "upper" }),
            country,
            phone: generatePhoneNumber(country),
        };
    });
}

function generateSchoolData() {
    return Array.from({ length: SCHOOL_COUNT }, () => {
        const country = getRandomCountry();
        return {
            name: faker.company.name() + " " + faker.helpers.arrayElement(["University", "College", "Institute"]),
            country,
            phone: generatePhoneNumber(country),
        };
    });
}

async function seedDatabase() {
    console.log(`🌱 Seeding ${STUDENT_COUNT} students and ${SCHOOL_COUNT} schools...`);

    try {
        // Seed students
        const studentsData = generateStudentData();
        const insertedStudents = [];

        for (const studentData of studentsData) {
            const [insertedStudent] = await db.insert(student).values(studentData).returning();
            insertedStudents.push(insertedStudent);
            console.log(`✅ Added student: ${studentData.name} (${studentData.passport}) from ${studentData.country}`);
        }

        // Seed schools
        const schoolsData = generateSchoolData();
        const insertedSchools = [];

        for (const schoolData of schoolsData) {
            const [insertedSchool] = await db.insert(school).values(schoolData).returning();
            insertedSchools.push(insertedSchool);
            console.log(`✅ Added school: ${schoolData.name} in ${schoolData.country}`);
        }

        // Seed school-student relationships
        console.log("🔗 Creating school-student relationships...");

        for (const studentRecord of insertedStudents) {
            // Each student enrolled in 1-2 schools
            const schoolsToEnroll = faker.helpers.arrayElements(insertedSchools, { min: 1, max: 2 });

            for (const schoolRecord of schoolsToEnroll) {
                await db.insert(schoolstudents).values({
                    schoolId: schoolRecord.id,
                    studentId: studentRecord.id,
                    description: faker.helpers.arrayElement(["Full-time student", "Part-time student", "Exchange student", "Graduate student", "Visiting student"]),
                });
                console.log(`🔗 Enrolled ${studentRecord.name} at ${schoolRecord.name}`);
            }
        }

        console.log("🎉 Database seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedDatabase();
