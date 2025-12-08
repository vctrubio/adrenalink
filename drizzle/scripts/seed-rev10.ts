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
    referral,
} from "../schema.js";

config({ path: ".env.local" });

// Connect to DB
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// DRY Functions
const createSchool = async () => {
    const [s] = await db
        .insert(school)
        .values({
            name: "Reva Kite School",
            username: "reva10",
            country: "Spain",
            phone: faker.string.numeric(10),
            status: "active",
            latitude: "40.4168",
            longitude: "-3.7038",
            timezone: "Europe/Madrid",
            googlePlaceId: faker.string.uuid(),
            equipmentCategories: "kite,wing",
            websiteUrl: faker.internet.url(),
            instagramUrl: faker.internet.url(),
        })
        .returning();
    console.log("✅ Created school:", s.id, "Username: reva10 (Madrid, Spain) - Timezone: Europe/Madrid");
    return s;
};

const createTeachers = async (schoolId: string) => {
    const teachers = Array.from({ length: 2 }, () => ({
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
        { teacherId, commissionType: "percentage", cph: "20.00", description: "Standard 20% commission" },
        { teacherId, commissionType: "percentage", cph: "25.00", description: "Premium 25% commission" },
        { teacherId, commissionType: "fixed", cph: "50.00", description: "Fixed €50 per hour" },
    ];

    const result = await db.insert(teacherCommission).values(commissions).returning();
    console.log(`✅ Created ${result.length} commissions for teacher ${teacherId.substring(0, 8)}`);
    return result;
};

const createStudents = async (count = 8) => {
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
        { sku: `KITE001-${faker.string.uuid()}`, model: "Duotone Neo 9m", color: "Blue", size: 9, category: "kite", status: "rental" },
        { sku: `KITE002-${faker.string.uuid()}`, model: "North Carve 7m", color: "Red", size: 7, category: "kite", status: "rental" },
        { sku: `WING001-${faker.string.uuid()}`, model: "Duotone Echo 5m", color: "Green", size: 5, category: "wing", status: "rental" },
        { sku: `WING002-${faker.string.uuid()}`, model: "F-One Swing 4.2m", color: "Yellow", size: 4, category: "wing", status: "rental" },
    ].map((item) => ({ ...item, schoolId }));

    const result = await db.insert(equipment).values(items).returning();
    console.log(`✅ Created ${result.length} equipment`);
    return result;
};

const createSchoolPackages = async (schoolId: string) => {
    const packages = [
        { durationMinutes: 120, pricePerStudent: 120, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "kite", packageType: "lessons", schoolId, description: "Private Kite Lesson", isPublic: true, active: true },
        { durationMinutes: 90, pricePerStudent: 90, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "wing", packageType: "lessons", schoolId, description: "Private Wing Lesson", isPublic: true, active: true },
        { durationMinutes: 180, pricePerStudent: 80, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "kite", packageType: "rental", schoolId, description: "3h Kite Rental", isPublic: true, active: true },
        { durationMinutes: 180, pricePerStudent: 70, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "wing", packageType: "rental", schoolId, description: "3h Wing Rental", isPublic: true, active: true },
        { durationMinutes: 120, pricePerStudent: 75, capacityStudents: 2, capacityEquipment: 2, categoryEquipment: "kite", packageType: "lessons", schoolId, description: "Duo Kite Lesson", isPublic: true, active: true },
        { durationMinutes: 150, pricePerStudent: 65, capacityStudents: 3, capacityEquipment: 3, categoryEquipment: "wing", packageType: "lessons", schoolId, description: "Group Wing Lesson (3 Students)", isPublic: true, active: true },
        { durationMinutes: 180, pricePerStudent: 55, capacityStudents: 4, capacityEquipment: 4, categoryEquipment: "kite", packageType: "lessons", schoolId, description: "Team Kite Lesson (4 Students)", isPublic: true, active: true },
        { durationMinutes: 240, pricePerStudent: 50, capacityStudents: 5, capacityEquipment: 5, categoryEquipment: "wing", packageType: "lessons", schoolId, description: "Large Group Wing Class (5 Students)", isPublic: true, active: true },
    ];

    const result = await db.insert(schoolPackage).values(packages).returning();
    console.log(`✅ Created ${result.length} school packages`);
    return result;
};

const createReferrals = async (schoolId: string) => {
    const referrals = [
        { code: "ALFA-2024", schoolId, commissionType: "percentage", commissionValue: "10.00", description: "Standard affiliate 10% per booking", active: true },
        { code: "BETA-2024", schoolId, commissionType: "percentage", commissionValue: "15.00", description: "Premium affiliate 15% per booking", active: true },
        { code: "GAMMA-2024", schoolId, commissionType: "fixed", commissionValue: "50.00", description: "Corporate fixed €50 per booking", active: true },
        { code: "DELTA-2024", schoolId, commissionType: "fixed", commissionValue: "75.00", description: "VIP fixed €75 per booking", active: true },
        { code: "EPSILON-2024", schoolId, commissionType: "percentage", commissionValue: "20.00", description: "Premium partner 20% per booking", active: true },
    ];

    const result = await db.insert(referral).values(referrals).returning();
    console.log(`✅ Created ${result.length} referrals`);
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

        // Ensure booking table includes INSERT operations
        try {
            await client`ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE booking`;
            console.log("✅ Booking table configured to publish INSERT, UPDATE, DELETE");
        } catch (err: any) {
            console.warn("⚠️  Could not set publish operations for booking table:", err.message);
        }

        // Enable Realtime for event table with all operations
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

        // Ensure event table includes DELETE operations
        try {
            await client`ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE event`;
            console.log("✅ Event table configured to publish INSERT, UPDATE, DELETE");
        } catch (err: any) {
            console.warn("⚠️  Could not set publish operations for event table:", err.message);
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

        // Ensure lesson table includes DELETE operations
        try {
            await client`ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE lesson`;
            console.log("✅ Lesson table configured to publish INSERT, UPDATE, DELETE");
        } catch (err: any) {
            console.warn("⚠️  Could not set publish operations for lesson table:", err.message);
        }

        console.log("\n🎉 All tables configured for Realtime listening!");
    } catch (error) {
        console.error("❌ Error enabling Realtime:", error);
        throw error;
    }
};

const main = async () => {
    try {
        console.log("🌱 Starting seed-rev10...\n");

        // 1. Create School
        const schoolRecord = await createSchool();
        const schoolId = schoolRecord.id;

        // 2. Create Teachers
        const teachers = await createTeachers(schoolId);
        const teacherIds = teachers.map((t) => t.id);

        // 3. Create Teacher Commissions
        await Promise.all(teacherIds.map((id) => createTeacherCommissions(id)));

        // 4. Create Students
        const students = await createStudents(8);

        // 5. Associate Students with School
        await associateStudentsWithSchool(schoolId, students);

        // 6. Create Equipment
        await createEquipment(schoolId);

        // 7. Create School Packages
        await createSchoolPackages(schoolId);

        // 8. Create Referrals
        await createReferrals(schoolId);

        // 9. Enable Realtime Listeners
        await enableRealtimeListeners();

        console.log("\n✨ Seed-rev10 completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log(`   Teachers: ${teacherIds.length}`);
        console.log(`   Students: ${students.length}`);
        console.log("   Packages: 8 packages created (including 4 new group packages)");
        console.log("   Referrals: 5 codes created");
        console.log("   Realtime: Tables configured for listening");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
};

main();
