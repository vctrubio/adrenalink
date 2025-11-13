import { config } from "dotenv";
import { db } from "../db";
import { booking, student, bookingStudent, studentPackage, schoolPackage } from "../schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function seedBookingStudent() {
    console.log("📊 Creating booking-student relationships for testing...");

    try {
        // Get all students
        const students = await db.select().from(student);
        console.log(`✅ Found ${students.length} students`);

        if (students.length === 0) {
            console.error("❌ No students found. Run 'npm run db:seed-all' first.");
            process.exit(1);
        }

        // Get all bookings
        const bookings = await db.select().from(booking);
        console.log(`✅ Found ${bookings.length} bookings`);

        if (bookings.length === 0) {
            console.error("❌ No bookings found. Run 'npm run db:seed-all' first.");
            process.exit(1);
        }

        // Get all student packages to check capacities
        const packages = await db.select().from(studentPackage);
        console.log(`✅ Found ${packages.length} student packages`);

        // For each booking, add random students (respect package capacity)
        let totalLinked = 0;

        for (const bookingRecord of bookings) {
            // Find the associated student package
            const studentPkg = packages.find(sp => sp.id === bookingRecord.studentPackageId);
            if (!studentPkg) {
                console.warn(`⚠️  Booking ${bookingRecord.id} has no student package, skipping...`);
                continue;
            }

            // Get the school package to check capacity
            const schoolPkg = await db.select().from(schoolPackage).where(eq(schoolPackage.id, studentPkg.schoolPackageId));
            if (schoolPkg.length === 0) {
                console.warn(`⚠️  Student package ${studentPkg.id} has no school package, skipping...`);
                continue;
            }

            const capacity = schoolPkg[0].capacityStudents;

            // Get random students (up to capacity)
            const randomStudents = faker.helpers.arrayElements(students, {
                min: 1,
                max: Math.min(capacity, students.length),
            });

            // Link students to booking
            const existingLinks = await db.select().from(bookingStudent).where(eq(bookingStudent.bookingId, bookingRecord.id));
            const existingStudentIds = new Set(existingLinks.map(link => link.studentId));

            for (const s of randomStudents) {
                if (!existingStudentIds.has(s.id)) {
                    await db.insert(bookingStudent).values({
                        bookingId: bookingRecord.id,
                        studentId: s.id,
                    });
                    totalLinked++;
                }
            }

            console.log(`✅ Linked ${randomStudents.length} students to booking ${bookingRecord.id.substring(0, 8)}...`);
        }

        console.log("\n🎉 Booking-student relationships created!");
        console.log(`📋 Summary:`);
        console.log(`   Total student-booking links created: ${totalLinked}`);
        console.log(`   Total bookings processed: ${bookings.length}`);

    } catch (error) {
        console.error("❌ Error creating booking-student relationships:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedBookingStudent();
