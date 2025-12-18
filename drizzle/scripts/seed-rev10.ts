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
    booking,
    studentPackage,
    bookingStudent,
    lesson,
    event,
    equipmentEvent,
    teacherEquipment,
    teacherLessonPayment,
    studentBookingPayment,
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
            username: "reva10",
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
    console.log("✅ Created school:", s.id, "Username: reva10 (Madrid, Spain) - Currency: EUR - Timezone: Europe/Madrid");
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
        { durationMinutes: 120, pricePerStudent: 75, capacityStudents: 2, capacityEquipment: 2, categoryEquipment: "kite", packageType: "lessons", schoolId, description: "Duo Kite Lesson", isPublic: true, active: true },
        { durationMinutes: 150, pricePerStudent: 65, capacityStudents: 3, capacityEquipment: 3, categoryEquipment: "wing", packageType: "lessons", schoolId, description: "Group Wing Lesson (3 Students)", isPublic: true, active: true },
    ];

    const result = await db.insert(schoolPackage).values(packages).returning();
    console.log(`✅ Created ${result.length} school packages (lessons only)`);
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

const createStudentPackages = async (schoolPackageIds: string[]) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const studentPackages = schoolPackageIds.map((pkgId) => ({
        schoolPackageId: pkgId,
        referralId: null as any,
        walletId: faker.string.uuid(),
        requestedDateStart: startDate.toISOString().split("T")[0],
        requestedDateEnd: endDate.toISOString().split("T")[0],
        status: "accepted" as const,
    }));

    const result = await db.insert(studentPackage).values(studentPackages).returning();
    console.log(`✅ Created ${result.length} student packages`);
    return result;
};

const createBookings = async (schoolId: string, students: any[], studentPackages: any[], schoolPackages: any[]) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const bookingRecords: any[] = [];
    const studentMappings: Array<{ bookingIndex: number; studentIds: string[] }> = [];

    // Distribute students across bookings - each student gets max 2 bookings (average 1)
    let studentIndex = 0;
    const studentBookingCount: Record<string, number> = {};

    for (const pkg of schoolPackages) {
        const matchedPackage = studentPackages.find((sp) => sp.schoolPackageId === pkg.id);
        if (!matchedPackage) continue;

        // Get students for this booking up to package capacity
        const assignedStudents: any[] = [];
        let nextStudentIndex = studentIndex;

        // Try to get new students first, then recycle students with < 2 bookings if needed
        for (let i = 0; i < pkg.capacityStudents; i++) {
            if (nextStudentIndex < students.length) {
                // Use fresh student
                assignedStudents.push(students[nextStudentIndex]);
                studentBookingCount[students[nextStudentIndex].id] = (studentBookingCount[students[nextStudentIndex].id] || 0) + 1;
                nextStudentIndex++;
            } else {
                // Find a student with < 2 bookings to recycle
                const recycleStudent = students.find((s) => (studentBookingCount[s.id] || 0) < 2);
                if (recycleStudent) {
                    assignedStudents.push(recycleStudent);
                    studentBookingCount[recycleStudent.id] = (studentBookingCount[recycleStudent.id] || 0) + 1;
                } else {
                    break; // No more students available
                }
            }
        }

        if (assignedStudents.length === 0) break;

        studentIndex = nextStudentIndex;

        const bookingRecord = {
            schoolId,
            studentPackageId: matchedPackage.id,
            dateStart: startDate.toISOString().split("T")[0],
            dateEnd: endDate.toISOString().split("T")[0],
            leaderStudentName: `${assignedStudents[0].firstName} ${assignedStudents[0].lastName}`,
            status: "completed" as const,
        };

        bookingRecords.push(bookingRecord);
        studentMappings.push({
            bookingIndex: bookingRecords.length - 1,
            studentIds: assignedStudents.map((s) => s.id),
        });
    }

    const result = await db.insert(booking).values(bookingRecords).returning();

    // Map the inserted bookings to their students by index order
    const bookingStudentsMap = new Map<string, string[]>();
    for (let i = 0; i < result.length; i++) {
        const booking = result[i];
        const mapping = studentMappings[i];
        bookingStudentsMap.set(booking.id, mapping.studentIds);
    }

    console.log(`✅ Created ${result.length} bookings with distributed students (all COMPLETED)`);
    return { bookings: result, studentMap: bookingStudentsMap };
};

const linkStudentsToBookings = async (bookingData: { bookings: any[]; studentMap: Map<string, string[]> }) => {
    const bookingStudents = bookingData.bookings.flatMap((bk) => {
        const studentIds = bookingData.studentMap.get(bk.id) || [];
        return studentIds.map((studentId: string) => ({
            bookingId: bk.id,
            studentId,
        }));
    });

    await db.insert(bookingStudent).values(bookingStudents);
    console.log(`✅ Linked ${bookingStudents.length} student-booking relations`);
};

const createLessonsAndEventsAndEquipmentEvents = async (
    bookings: any[],
    teachers: any[],
    teacherCommissions: any[],
    schoolId: string,
    packages: any[],
    equipmentRecords: any[],
    studentPackages: any[],
) => {
    const lessons = [];
    const events = [];
    const equipmentEvents = [];

    // Step 1: Build lesson records with event data
    for (const bk of bookings) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const teacherComms = teacherCommissions.filter((tc) => tc.teacherId === teacher.id);
        if (teacherComms.length === 0) continue;

        const commission = teacherComms[0];
        
        // Find student package, then find school package to get category
        const studentPkg = studentPackages.find((sp) => sp.id === bk.studentPackageId);
        const schoolPkg = studentPkg ? packages.find((p) => p.id === studentPkg.schoolPackageId) : null;

        const lessonRecord = {
            schoolId,
            teacherId: teacher.id,
            bookingId: bk.id,
            commissionId: commission.id,
            status: "completed" as const,
        };

        lessons.push(lessonRecord);

        // Create 2-3 events per lesson
        const numEvents = faker.number.int({ min: 2, max: 3 });
        const baseDate = new Date();

        for (let i = 0; i < numEvents; i++) {
            const eventDate = new Date(baseDate);
            eventDate.setDate(eventDate.getDate() + i);

            events.push({
                schoolId,
                lessonId: "", // Will be set after lessons are inserted
                date: eventDate,
                duration: 60 + faker.number.int({ min: 0, max: 60 }),
                location: faker.location.city(),
                status: "completed" as const,
                _lessonIndex: lessons.length - 1,
                _packageCategory: schoolPkg?.categoryEquipment,
                _capacityEquipment: schoolPkg?.capacityEquipment,
            });
        }
    }

    // Step 2: Insert lessons
    const insertedLessons = await db.insert(lesson).values(lessons).returning();
    console.log(`✅ Created ${insertedLessons.length} lessons (all COMPLETED)`);

    // Step 3: Map events to lesson IDs and insert
    const eventsToInsert = events.map((evt) => {
        const { _lessonIndex, _packageCategory, _capacityEquipment, ...rest } = evt;
        return {
            ...rest,
            lessonId: insertedLessons[_lessonIndex]?.id || insertedLessons[0].id,
        };
    });

    const insertedEvents = await db.insert(event).values(eventsToInsert).returning();
    console.log(`✅ Created ${insertedEvents.length} events (all COMPLETED)`);

    // Step 4: Create equipment events based on package category
    for (let i = 0; i < insertedEvents.length; i++) {
        const evt = insertedEvents[i];
        const eventData = events[i];
        const packageCategory = eventData._packageCategory;
        const capacityEquipment = eventData._capacityEquipment;

        if (!packageCategory) continue;

        const matchingEquipment = equipmentRecords.filter((eq) => eq.category === packageCategory);
        const selectedEquipment = matchingEquipment.slice(0, capacityEquipment || 1);

        for (const eq of selectedEquipment) {
            equipmentEvents.push({
                equipmentId: eq.id,
                eventId: evt.id,
            });
        }
    }

    if (equipmentEvents.length > 0) {
        await db.insert(equipmentEvent).values(equipmentEvents);
        console.log(`✅ Created ${equipmentEvents.length} equipment-event links`);
    }

    return insertedLessons;
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

const createTeacherLessonPayments = async (lessons: any[]) => {
    const payments = lessons.map((lesson) => ({
        lessonId: lesson.id,
        amount: faker.number.int({ min: 30, max: 100 }),
    }));

    const result = await db.insert(teacherLessonPayment).values(payments).returning();
    console.log(`✅ Created ${result.length} teacher lesson payments`);
    return result;
};

const createStudentBookingPayments = async (bookings: any[], bookingStudents: Map<string, string[]>) => {
    const payments = [];

    for (const bookingRecord of bookings) {
        const studentIds = bookingStudents.get(bookingRecord.id) || [];
        for (const studentId of studentIds) {
            payments.push({
                bookingId: bookingRecord.id,
                studentId,
                amount: faker.number.int({ min: 50, max: 200 }),
            });
        }
    }

    const result = await db.insert(studentBookingPayment).values(payments).returning();
    console.log(`✅ Created ${result.length} student booking payments`);
    return result;
};

// Statuses are now set during creation (completed on bookings, lessons, events)

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
        const allTeacherCommissions = [];
        for (const id of teacherIds) {
            const comms = await createTeacherCommissions(id);
            allTeacherCommissions.push(...comms);
        }

        // 4. Create Students
        const students = await createStudents(8);

        // 5. Associate Students with School
        await associateStudentsWithSchool(schoolId, students);

        // 6. Create Equipment
        const equipmentRecords = await createEquipment(schoolId);

        // 7. Create School Packages
        const packages = await createSchoolPackages(schoolId);
        const packageIds = packages.map((p) => p.id);

        // 8. Create Referrals
        await createReferrals(schoolId);

        // 9. Create Student Packages
        const studentPackages = await createStudentPackages(packageIds);

        // 10. Create Bookings (all COMPLETED)
        const bookingData = await createBookings(schoolId, students, studentPackages, packages);
        const bookings = bookingData.bookings;

        // 11. Link Students to Bookings
        await linkStudentsToBookings(bookingData);

        // 12. Create Lessons + Events + Equipment Events (all COMPLETED, all in one function)
        const lessons = await createLessonsAndEventsAndEquipmentEvents(
            bookings,
            teachers,
            allTeacherCommissions,
            schoolId,
            packages,
            equipmentRecords,
            studentPackages,
        );

        // 13. Create Teacher Equipment Relations
        await createTeacherEquipmentRelations(teachers, equipmentRecords);

        // 14. Create Teacher Lesson Payments
        await createTeacherLessonPayments(lessons);

        // 15. Create Student Booking Payments
        await createStudentBookingPayments(bookings, bookingData.studentMap);

        // 16. Enable Realtime Listeners
        await enableRealtimeListeners();

        console.log("\n✨ Seed-rev10 completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log(`   Teachers: ${teacherIds.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Bookings: ${bookings.length} (all COMPLETED)`);
        console.log(`   Lessons: ${lessons.length} (all COMPLETED)`);
        console.log(`   Events: ~${lessons.length * 2.5 | 0} (all COMPLETED)`);
        console.log(`   Equipment: ${equipmentRecords.length} items`);
        console.log("   Teacher-Equipment Relations: ✅");
        console.log("   Teacher Lesson Payments: ✅");
        console.log("   Student Booking Payments: ✅");
        console.log("   Referrals: 5 codes");
        console.log("   Realtime: Configured");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
};

// ============ EXECUTION ============

main();
