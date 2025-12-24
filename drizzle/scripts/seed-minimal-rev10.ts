import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { faker } from "@faker-js/faker";
import {
    school,
    teacher,
    student,
    schoolStudents,
    equipment,
    schoolPackage,
    teacherCommission,
    teacherEquipment,
} from "../schema.js";

config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// ============ CREATE FUNCTIONS ============

const createSchool = async () => {
    const [s] = await db
        .insert(school)
        .values({
            ownerId: faker.string.uuid(),
            name: "Reva Kite School",
            username: "reva-minimal",
            country: "Spain",
            phone: faker.string.numeric(10),
            status: "active",
            currency: "EUR",
            latitude: "40.4168",
            longitude: "-3.7038",
            timezone: "Europe/Madrid",
            googlePlaceId: faker.string.uuid(),
            equipmentCategories: "kite,wing",
            websiteUrl: faker.internet.url(),
            instagramUrl: faker.internet.url(),
        })
        .returning();
    console.log("✅ Created school:", s.id, "Username: reva-minimal (Madrid, Spain) - Currency: EUR");
    return s;
};

const createTeachers = async (schoolId: string) => {
    const teachers = Array.from({ length: 3 }, () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: faker.internet.username().toLowerCase(),
        passport: faker.string.alphanumeric(10).toUpperCase(),
        country: faker.location.country(),
        phone: faker.string.numeric(10),
        schoolId,
        languages: [faker.helpers.arrayElement(["Portuguese", "English", "Spanish", "French", "German"])],
    }));

    const result = await db.insert(teacher).values(teachers).returning();
    console.log(`✅ Created ${result.length} teachers`);
    return result;
};

const createTeacherCommissions = async (teacherId: string) => {
    const commissions = [
        { teacherId, commissionType: "percentage" as const, cph: "20.00", description: "Standard 20% commission" },
        { teacherId, commissionType: "percentage" as const, cph: "25.00", description: "Premium 25% commission" },
        { teacherId, commissionType: "fixed" as const, cph: "50.00", description: "Fixed €50 per hour" },
    ];

    const result = await db.insert(teacherCommission).values(commissions).returning();
    console.log(`✅ Created ${result.length} commissions for teacher ${teacherId.substring(0, 8)}`);
    return result;
};

const createStudents = async (count = 12) => {
    const students = Array.from({ length: count }, () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        passport: faker.string.alphanumeric(10).toUpperCase(),
        country: faker.location.country(),
        phone: faker.string.numeric(10),
        languages: [faker.helpers.arrayElement(["English", "Spanish", "German", "French", "Italian", "Dutch"])],
    }));

    const result = await db.insert(student).values(students).returning();
    console.log(`✅ Created ${result.length} students`);
    return result;
};

const associateStudentsWithSchool = async (schoolId: string, students: any[]) => {
    const schoolStudentRelations = students.map((student) => ({
        schoolId,
        studentId: student.id,
        description: faker.lorem.sentence(),
    }));
    await db.insert(schoolStudents).values(schoolStudentRelations);
    console.log(`✅ Associated ${students.length} students with school`);
};

const createEquipment = async (schoolId: string) => {
    const items = [
        { sku: `KITE001-${faker.string.uuid()}`, model: "Duotone Neo 9m", color: "Blue", size: 9, category: "kite" as const, status: "rental" as const },
        { sku: `KITE002-${faker.string.uuid()}`, model: "North Carve 7m", color: "Red", size: 7, category: "kite" as const, status: "rental" as const },
        { sku: `WING001-${faker.string.uuid()}`, model: "Duotone Echo 5m", color: "Green", size: 5, category: "wing" as const, status: "rental" as const },
        { sku: `WING002-${faker.string.uuid()}`, model: "F-One Swing 4.2m", color: "Yellow", size: 4, category: "wing" as const, status: "rental" as const },
    ].map((item) => ({ ...item, schoolId }));

    const result = await db.insert(equipment).values(items).returning();
    console.log(`✅ Created ${result.length} equipment`);
    return result;
};

const createSchoolPackages = async (schoolId: string) => {
    const packages = [
        { durationMinutes: 120, pricePerStudent: 120, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "kite" as const, packageType: "lessons" as const, schoolId, description: "Private Kite Lesson", isPublic: true, active: true },
        { durationMinutes: 90, pricePerStudent: 90, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "wing" as const, packageType: "lessons" as const, schoolId, description: "Private Wing Lesson", isPublic: true, active: true },
        { durationMinutes: 120, pricePerStudent: 75, capacityStudents: 2, capacityEquipment: 2, categoryEquipment: "kite" as const, packageType: "lessons" as const, schoolId, description: "Duo Kite Lesson", isPublic: true, active: true },
        { durationMinutes: 150, pricePerStudent: 65, capacityStudents: 3, capacityEquipment: 3, categoryEquipment: "wing" as const, packageType: "lessons" as const, schoolId, description: "Group Wing Lesson (3 Students)", isPublic: true, active: true },
    ];

    const result = await db.insert(schoolPackage).values(packages).returning();
    console.log(`✅ Created ${result.length} school packages`);
    return result;
};

const createTeacherEquipmentRelations = async (teachers: any[], equipment: any[]) => {
    const teacherEquipmentRecords = [];

    // Assign each teacher 2-3 random equipment items
    for (const teacher of teachers) {
        const numEquipment = faker.number.int({ min: 2, max: 3 });
        const assignedEquipment = equipment.sort(() => 0.5 - Math.random()).slice(0, numEquipment);

        for (const eq of assignedEquipment) {
            teacherEquipmentRecords.push({
                teacherId: teacher.id,
                equipmentId: eq.id,
                active: true,
            });
        }
    }

    const result = await db.insert(teacherEquipment).values(teacherEquipmentRecords).returning();
    console.log(`✅ Created ${result.length} teacher-equipment relations`);
    return result;
};

const enableRealtimeListeners = async () => {
    try {
        console.log("\n🚀 Enabling Realtime for tables...\n");

        // Enable Realtime for booking table
        try {
            await client`ALTER PUBLICATION supabase_realtime ADD TABLE booking`;
            console.log("✅ Realtime enabled for booking table");
        } catch (err: any) {
            if (err.code === "42710") {
                console.log("ℹ️  booking table already in publication");
            } else {
                throw err;
            }
        }

        // Enable Realtime for event table
        try {
            await client`ALTER PUBLICATION supabase_realtime ADD TABLE event`;
            console.log("✅ Realtime enabled for event table");
        } catch (err: any) {
            if (err.code === "42710") {
                console.log("ℹ️  event table already in publication");
            } else {
                throw err;
            }
        }

        // Enable Realtime for lesson table
        try {
            await client`ALTER PUBLICATION supabase_realtime ADD TABLE lesson`;
            console.log("✅ Realtime enabled for lesson table");
        } catch (err: any) {
            if (err.code === "42710") {
                console.log("ℹ️  lesson table already in publication");
            } else {
                throw err;
            }
        }

        console.log("\n🎉 All tables configured for Realtime listening!");
    } catch (error) {
        console.error("❌ Error enabling Realtime:", error);
        throw error;
    }
};

const main = async () => {
    try {
        console.log("🌱 Starting seed-minimal-rev10...\n");

        // 1. Create School
        const schoolRecord = await createSchool();
        const schoolId = schoolRecord.id;

        // 2. Create Teachers
        const teachers = await createTeachers(schoolId);
        const teacherIds = teachers.map((t) => t.id);

        // 3. Create Teacher Commissions (3 per teacher)
        const allTeacherCommissions = [];
        for (const id of teacherIds) {
            const comms = await createTeacherCommissions(id);
            allTeacherCommissions.push(...comms);
        }

        // 4. Create Students
        const students = await createStudents(12);

        // 5. Associate Students with School
        await associateStudentsWithSchool(schoolId, students);

        // 6. Create Equipment
        const equipmentRecords = await createEquipment(schoolId);

        // 7. Create School Packages
        const packages = await createSchoolPackages(schoolId);

        // 8. Create Teacher Equipment Relations
        await createTeacherEquipmentRelations(teachers, equipmentRecords);

        // 9. Enable Realtime Listeners
        await enableRealtimeListeners();

        console.log("\n✨ Seed-minimal-rev10 completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log(`   Teachers: ${teacherIds.length} with ${allTeacherCommissions.length} total commissions`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Equipment: ${equipmentRecords.length} items`);
        console.log("   Teacher-Equipment Relations: ✅");
        console.log("   Realtime: Configured");
        console.log("\n🎯 Ready for testing the register route!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
};

// ============ EXECUTION ============

main();
