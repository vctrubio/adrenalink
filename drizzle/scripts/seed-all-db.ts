// seed.js
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import {
    school,
    teacher,
    student,
    schoolStudents,
    equipment,
    schoolPackage,
    studentPackage,
    booking,
    bookingStudent,
    lesson,
    event,
    rental,
    equipmentEvent,
    teacherEquipment,
    equipmentCategoryEnum,
    packageTypeEnum,
    schoolStatusEnum,
    lessonStatusEnum,
    eventStatusEnum,
    rentalStatusEnum,
    teacherCommission,
    teacherLessonPayment,
    equipmentRepair,
} from "../schema.js"; // <-- your schema file

config({ path: ".env.local" });

// Connect to DB
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Helper: Random choice
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const createTeacherCommissions = async (teacherId) => {
    const commissions = [
        { teacherId, commissionType: 'percentage', cph: '25.00', description: 'Standard 25% commission' },
    ];
    const result = await db.insert(teacherCommission).values(commissions).returning();
    console.log(`Created 1 teacher commission for teacher ${teacherId}`);
    return result;
};

// Dry functions
const createSchool = async () => {
    const [s] = await db
        .insert(school)
        .values({
            name: "Kite Paradise School",
            username: "kiteparadise",
            country: "Portugal",
            phone: "+351912345678",
            status: "active",
            latitude: "37.123456",
            longitude: "-8.654321",
            googlePlaceId: "ChIJ1234567890",
            equipmentCategories: "kite,wing",
            websiteUrl: "https://kiteparadise.com",
            instagramUrl: "https://instagram.com/kiteparadise",
        })
        .returning();
    console.log("Created school:", s.id);
    return s;
};

const createTeachers = async (schoolId) => {
    const teachers = [
        { firstName: "Marco", lastName: "Silva", username: "marco", passport: "PT123456", country: "Portugal", phone: "+351911111111", schoolId, languages: ["Portuguese", "English"] },
        { firstName: "Ana", lastName: "Costa", username: "ana", passport: "PT789012", country: "Portugal", phone: "+351922222222", schoolId, languages: ["Portuguese", "English", "Spanish"] },
    ];

    const result = await db.insert(teacher).values(teachers).returning();
    console.log(`Created ${result.length} teachers`);
    return result;
};

const createStudents = async (count = 8) => {
    const firstNames = ["Liam", "Emma", "Noah", "Olivia", "Ava", "Isabella", "Sophia", "Mia"];
    const lastNames = ["Garcia", "Martinez", "Lopez", "Wilson", "Brown", "Davis", "Taylor", "Clark"];
    const countries = ["Spain", "France", "Germany", "UK", "USA", "Italy", "Netherlands", "Portugal"];
    const languages = [["English"], ["Spanish", "English"], ["German"], ["French", "English"], ["Italian"], ["English", "Dutch"]];

    const students = Array.from({ length: count }, (_, i) => ({
        firstName: randomChoice(firstNames),
        lastName: randomChoice(lastNames),
        passport: `PASS${1000 + i}`,
        country: randomChoice(countries),
        phone: `+34${600000000 + i}`,
        languages: randomChoice(languages),
    }));

    const result = await db.insert(student).values(students).returning();
    console.log(`Created ${result.length} students`);
    return result;
};

const createEquipment = async (schoolId) => {
    const items = [
        { sku: "KITE001", model: "Duotone Neo 9m", color: "Blue", size: 9, category: "kite", status: "rental" },
        { sku: "KITE002", model: "North Carve 7m", color: "Red", size: 7, category: "kite", status: "rental" },
        { sku: "WING001", model: "Duotone Echo 5m", color: "Green", size: 5, category: "wing", status: "rental" },
        { sku: "WING002", model: "F-One Swing 4.2m", color: "Yellow", size: 4, category: "wing", status: "rental" },
    ].map((item) => ({ ...item, schoolId }));

    const result = await db.insert(equipment).values(items).returning();
    console.log(`Created ${result.length} equipment`);
    return result;
};

const createSchoolPackages = async (schoolId) => {
    const packages = [
        { durationMinutes: 120, pricePerStudent: 120, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "kite", packageType: "lessons", schoolId, description: "Private Kite Lesson", isPublic: true, active: true },
        { durationMinutes: 90, pricePerStudent: 90, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "wing", packageType: "lessons", schoolId, description: "Private Wing Lesson", isPublic: true, active: true },
        { durationMinutes: 180, pricePerStudent: 80, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "kite", packageType: "rental", schoolId, description: "3h Kite Rental", isPublic: true, active: true },
        { durationMinutes: 180, pricePerStudent: 70, capacityStudents: 1, capacityEquipment: 1, categoryEquipment: "wing", packageType: "rental", schoolId, description: "3h Wing Rental", isPublic: true, active: true },
    ];

    const result = await db.insert(schoolPackage).values(packages).returning();
    console.log(`Created ${result.length} school packages`);
    return result;
};

const main = async () => {
    try {
        console.log("Starting seed...");

        // 1. School
        const schoolRecord = await createSchool();
        const schoolId = schoolRecord.id;

        // 2. Teachers
        const teachers = await createTeachers(schoolId);
        const teacherIds = teachers.map((t) => t.id);

        // Commissions
        const commission1 = (await createTeacherCommissions(teacherIds[0]))[0];
        const commission2 = (await createTeacherCommissions(teacherIds[1]))[0];

        // 3. Students
        const students = await createStudents(8);
        const studentIds = students.map((s) => s.id);

        // Associate all students with the school
        console.log(`Associating all ${students.length} students with school ${schoolRecord.name}...`);
        const schoolStudentRelations = students.map((student) => ({
            schoolId: schoolId,
            studentId: student.id,
            description: "Enrolled for lessons",
        }));
        await db.insert(schoolStudents).values(schoolStudentRelations);
        console.log("✅ Students associated with school.");

        // 4. Equipment
        const equipments = await createEquipment(schoolId);
        const equipmentIds = equipments.map((e) => e.id);
        const kiteEquipment = equipments.filter((e) => e.category === "kite");
        const wingEquipment = equipments.filter((e) => e.category === "wing");

        // Add a repair record for a kite
        await db.insert(equipmentRepair).values({
            equipmentId: kiteEquipment[0].id,
            checkIn: "2025-05-20",
            checkOut: "2025-05-25",
            price: 50,
            description: "Small tear in the canopy, patched and tested.",
        });
        console.log(`✅ Created equipment repair record for ${kiteEquipment[0].sku}`);

        // 5. School Packages
        const packages = await createSchoolPackages(schoolId);
        const lessonPackages = packages.filter((p) => p.packageType === "lessons");
        const rentalPackages = packages.filter((p) => p.packageType === "rental");

        // 6. Assign equipment to teachers (optional)
        await db.insert(teacherEquipment).values([
            { teacherId: teacherIds[0], equipmentId: equipmentIds[0] },
            { teacherId: teacherIds[1], equipmentId: equipmentIds[2] },
        ]);

        // 7. Student makes package request → booking → lesson → event → equipment
        const student1 = students[0];
        const teacher1 = teachers[0];
        const kiteLessonPkg = lessonPackages.find((p) => p.categoryEquipment === "kite");
        const kiteEq = kiteEquipment[0];

        // StudentPackage (request)
        const [studentPkg] = await db
            .insert(studentPackage)
            .values({
                studentId: student1.id,
                packageId: kiteLessonPkg.id,
                requestedDateStart: "2025-06-15",
                requestedDateEnd: "2025-06-15",
                status: "accepted",
            })
            .returning();

        // Booking
        const [bookingRecord] = await db
            .insert(booking)
            .values({
                packageId: kiteLessonPkg.id,
                dateStart: "2025-06-15",
                dateEnd: "2025-06-15",
                schoolId,
                studentPackageId: studentPkg.id,
            })
            .returning();

        await db.insert(bookingStudent).values({
            bookingId: bookingRecord.id,
            studentId: student1.id,
        });

        // Lesson
        const [lessonRecord] = await db
            .insert(lesson)
            .values({
                teacherId: teacher1.id,
                bookingId: bookingRecord.id,
                commissionId: commission1.id,
                status: "active",
            })
            .returning();

        // Add a payment for this lesson
        await db.insert(teacherLessonPayment).values({
            lessonId: lessonRecord.id,
            amount: 90,
        });
        console.log(`✅ Created payment record for lesson ${lessonRecord.id}`);

        // Event
        const [eventRecord] = await db
            .insert(event)
            .values({
                lessonId: lessonRecord.id,
                date: new Date("2025-06-15T10:00:00Z"),
                duration: 120,
                location: "Lagos Beach",
                status: "planned",
            })
            .returning();

        // Assign equipment to event
        await db.insert(equipmentEvent).values({
            equipmentId: kiteEq.id,
            eventId: eventRecord.id,
        });

        // 8. Rental example
        const student2 = students[1];
        const rentalPkg = rentalPackages.find((p) => p.categoryEquipment === "wing");
        const wingEq = wingEquipment[0];

        const [rentalStudentPkg] = await db
            .insert(studentPackage)
            .values({
                studentId: student2.id,
                packageId: rentalPkg.id,
                requestedDateStart: "2025-06-16",
                requestedDateEnd: "2025-06-16",
                status: "accepted",
            })
            .returning();

        const [rentalBooking] = await db
            .insert(booking)
            .values({
                packageId: rentalPkg.id,
                dateStart: "2025-06-16",
                dateEnd: "2025-06-16",
                schoolId,
                studentPackageId: rentalStudentPkg.id,
            })
            .returning();

        await db.insert(bookingStudent).values({
            bookingId: rentalBooking.id,
            studentId: student2.id,
        });

        // Rental
        await db.insert(rental).values({
            date: new Date("2025-06-16T14:00:00Z"),
            duration: 180,
            location: "Meia Praia",
            status: "planned",
            studentId: student2.id,
            equipmentId: wingEq.id,
        });

        // 9. More variety: another lesson + event
        const student3 = students[2];
        const wingLessonPkg = lessonPackages.find((p) => p.categoryEquipment === "wing");
        const wingEq2 = wingEquipment[1];

        const [sp3] = await db
            .insert(studentPackage)
            .values({
                studentId: student3.id,
                packageId: wingLessonPkg.id,
                requestedDateStart: "2025-06-17",
                requestedDateEnd: "2025-06-17",
                status: "accepted",
            })
            .returning();

        const [b3] = await db
            .insert(booking)
            .values({
                packageId: wingLessonPkg.id,
                dateStart: "2025-06-17",
                dateEnd: "2025-06-17",
                schoolId,
                studentPackageId: sp3.id,
            })
            .returning();

        await db.insert(bookingStudent).values({ bookingId: b3.id, studentId: student3.id });

        const [l3] = await db
            .insert(lesson)
            .values({
                teacherId: teacherIds[1],
                bookingId: b3.id,
                commissionId: commission2.id,
                status: "active",
            })
            .returning();

        const [e3] = await db
            .insert(event)
            .values({
                lessonId: l3.id,
                date: new Date("2025-06-17T09:00:00Z"),
                duration: 90,
                location: "Praia da Luz",
                status: "planned",
            })
            .returning();

        await db.insert(equipmentEvent).values({
            equipmentId: wingEq2.id,
            eventId: e3.id,
        });

        console.log("Seed completed successfully!");
        console.log(`
      School: ${schoolRecord.name}
      Students: ${students.length}
      Bookings with full chain: 2 (lesson + rental)
      Events with equipment: 2
    `);
    } catch (error) {
        console.error("Seed failed:", error);
    } finally {
        await client.end();
    }
};

main();
