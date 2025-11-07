// seed.js
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
    studentPackage,
    studentPackageStudent,
    booking,
    bookingStudent,
    lesson,
    event,
    rental,
    equipmentEvent,
    teacherEquipment,
    teacherCommission,
    teacherLessonPayment,
    studentBookingPayment,
    equipmentRepair,
} from "../schema.js"; // <-- your schema file

config({ path: ".env.local" });

// Connect to DB
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const createTeacherCommissions = async (teacherId) => {
    const commissions = [{ teacherId, commissionType: "percentage", cph: "25.00", description: "Standard 25% commission" }];
    const result = await db.insert(teacherCommission).values(commissions).returning();
    console.log(`Created 1 teacher commission for teacher ${teacherId}`);
    return result;
};

// Dry functions
const createSchool = async () => {
    const [s] = await db
        .insert(school)
        .values({
            name: faker.company.name() + " School",
            username: faker.internet.username().toLowerCase(),
            country: faker.location.country(),
            phone: faker.string.numeric(10),
            status: "active",
            latitude: faker.location.latitude({ max: 90, min: -90, precision: 6 }).toFixed(6),
            longitude: faker.location.longitude({ max: 180, min: -180, precision: 6 }).toFixed(6),
            googlePlaceId: faker.string.uuid(),
            equipmentCategories: "kite,wing",
            websiteUrl: faker.internet.url(),
            instagramUrl: faker.internet.url(),
        })
        .returning();
    console.log("Created school:", s.id);
    return s;
};

const createTeachers = async (schoolId) => {
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
    console.log(`Created ${result.length} teachers`);
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
    console.log(`Created ${result.length} students`);
    return result;
};

const createEquipment = async (schoolId) => {
    const items = [
        { sku: `KITE001-${faker.string.uuid()}`, model: "Duotone Neo 9m", color: "Blue", size: 9, category: "kite", status: "rental" },
        { sku: `KITE002-${faker.string.uuid()}`, model: "North Carve 7m", color: "Red", size: 7, category: "kite", status: "rental" },
        { sku: `WING001-${faker.string.uuid()}`, model: "Duotone Echo 5m", color: "Green", size: 5, category: "wing", status: "rental" },
        { sku: `WING002-${faker.string.uuid()}`, model: "F-One Swing 4.2m", color: "Yellow", size: 4, category: "wing", status: "rental" },
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

        // Associate all students with the school
        console.log(`Associating all ${students.length} students with school ${schoolRecord.name}...`);
        const schoolStudentRelations = students.map((student) => ({
            schoolId: schoolId,
            studentId: student.id,
            description: faker.lorem.sentence(),
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
            checkIn: faker.date.past().toISOString().split("T")[0],
            checkOut: faker.date.future().toISOString().split("T")[0],
            price: faker.number.int({ min: 20, max: 100 }),
            description: faker.lorem.sentence(),
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
        const kiteLessonPkg = faker.helpers.arrayElement(lessonPackages.filter((p) => p.categoryEquipment === "kite"));
        const kiteEq = faker.helpers.arrayElement(kiteEquipment);

        // StudentPackage (request) - walletId could be anyone (parent, student, school admin)
        const [studentPkg] = await db
            .insert(studentPackage)
            .values({
                walletId: student1.id, // For this seed, using student1's id as the wallet creator
                packageId: kiteLessonPkg.id,
                requestedDateStart: faker.date.future().toISOString().split("T")[0],
                requestedDateEnd: faker.date.future().toISOString().split("T")[0],
                status: "accepted",
            })
            .returning();

        // Link student(s) to the package - respect package capacity
        const studentsForPackage = students.slice(0, Math.min(kiteLessonPkg.capacityStudents, students.length));
        await db.insert(studentPackageStudent).values(
            studentsForPackage.map(s => ({
                studentPackageId: studentPkg.id,
                studentId: s.id,
            }))
        );

        // Booking
        const [bookingRecord] = await db
            .insert(booking)
            .values({
                dateStart: faker.date.future().toISOString().split("T")[0],
                dateEnd: faker.date.future().toISOString().split("T")[0],
                schoolId,
                studentPackageId: studentPkg.id,
            })
            .returning();

        // Link all students from studentPackage to booking
        await db.insert(bookingStudent).values(
            studentsForPackage.map(s => ({
                bookingId: bookingRecord.id,
                studentId: s.id,
            }))
        );

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
            amount: faker.number.int({ min: 50, max: 150 }),
        });
        console.log(`✅ Created payment record for lesson ${lessonRecord.id}`);

        // Add student booking payments for each student in the booking
        for (const s of studentsForPackage) {
            await db.insert(studentBookingPayment).values({
                bookingId: bookingRecord.id,
                studentId: s.id,
                amount: faker.number.int({ min: 100, max: 500 }),
            });
        }
        console.log(`✅ Created ${studentsForPackage.length} student payment(s) for booking ${bookingRecord.id}`);

        // Event
        const [eventRecord] = await db
            .insert(event)
            .values({
                lessonId: lessonRecord.id,
                date: faker.date.future(),
                duration: faker.number.int({ min: 60, max: 180 }),
                location: faker.location.city(),
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
        const rentalPkg = faker.helpers.arrayElement(rentalPackages.filter((p) => p.categoryEquipment === "wing"));
        const wingEq = faker.helpers.arrayElement(wingEquipment);

        const [rentalStudentPkg] = await db
            .insert(studentPackage)
            .values({
                walletId: student2.id, // Using student2's id as the wallet creator
                packageId: rentalPkg.id,
                requestedDateStart: faker.date.future().toISOString().split("T")[0],
                requestedDateEnd: faker.date.future().toISOString().split("T")[0],
                status: "accepted",
            })
            .returning();

        // Link student(s) to rental package
        const studentsForRental = [student2]; // Just one student for rental
        await db.insert(studentPackageStudent).values(
            studentsForRental.map(s => ({
                studentPackageId: rentalStudentPkg.id,
                studentId: s.id,
            }))
        );

        const [rentalBooking] = await db
            .insert(booking)
            .values({
                dateStart: faker.date.future().toISOString().split("T")[0],
                dateEnd: faker.date.future().toISOString().split("T")[0],
                schoolId,
                studentPackageId: rentalStudentPkg.id,
            })
            .returning();

        await db.insert(bookingStudent).values(
            studentsForRental.map(s => ({
                bookingId: rentalBooking.id,
                studentId: s.id,
            }))
        );

        // Rental
        await db.insert(rental).values({
            date: faker.date.future(),
            duration: 180,
            location: faker.location.city(),
            status: "planned",
            studentId: student2.id,
            equipmentId: wingEq.id,
        });

        // 9. More variety: another lesson + event with multiple students
        const student3 = students[2];
        const wingLessonPkg = faker.helpers.arrayElement(lessonPackages.filter((p) => p.categoryEquipment === "wing"));
        const wingEq2 = faker.helpers.arrayElement(wingEquipment);

        const [sp3] = await db
            .insert(studentPackage)
            .values({
                walletId: student3.id, // Using student3's id as the wallet creator
                packageId: wingLessonPkg.id,
                requestedDateStart: faker.date.future().toISOString().split("T")[0],
                requestedDateEnd: faker.date.future().toISOString().split("T")[0],
                status: "accepted",
            })
            .returning();

        // Link multiple students based on package capacity
        const studentsForWingLesson = students.slice(2, Math.min(2 + wingLessonPkg.capacityStudents, students.length));
        await db.insert(studentPackageStudent).values(
            studentsForWingLesson.map(s => ({
                studentPackageId: sp3.id,
                studentId: s.id,
            }))
        );

        const [b3] = await db
            .insert(booking)
            .values({
                dateStart: faker.date.future().toISOString().split("T")[0],
                dateEnd: faker.date.future().toISOString().split("T")[0],
                schoolId,
                studentPackageId: sp3.id,
            })
            .returning();

        await db.insert(bookingStudent).values(
            studentsForWingLesson.map(s => ({
                bookingId: b3.id,
                studentId: s.id,
            }))
        );

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
                date: faker.date.future(),
                duration: 90,
                location: faker.location.city(),
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
