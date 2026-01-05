/**
 * Mock Reva Kite School - Complete Seed
 * 
 * Orchestrates all seeding functions with Reva's specific credentials
 * Creates: 1 school (Reva Kite School), 2 teachers, 8 students, equipment, packages, etc.
 * 
 * Usage:
 *   npx ts-node supabase/db/mock-reva.ts
 * 
 * Or from UI (after adding to API routes):
 *   POST /api/seed/reva
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    associateStudentsWithSchool,
    createDefaultEquipment,
    createDefaultSchoolPackages,
    createStudentPackages,
    createDefaultReferrals,
    createBookings,
    linkStudentsToBookings,
    createLessonsAndEvents,
    createTeacherEquipmentRelations,
    createTeacherLessonPayments,
    createStudentBookingPayments,
    supabase,
} from "../seeding/index";

const seedRevaKiteSchool = async () => {
    try {
        console.log("🌱 Starting Reva Kite School Seed...\n");

        // 1. Create School (Reva Kite School, Madrid, Spain)
        const school = await createSchool({
            name: "Reva Kite School",
            username: "reva10",
            country: "Spain",
            phone: "34912345678",
            status: "beta",
            currency: "EUR",
            latitude: "40.4168",
            longitude: "-3.7038",
            timezone: "Europe/Madrid",
            website_url: "https://revakiteschool.com",
            instagram_url: "https://instagram.com/revakiteschool",
        });
        const schoolId = school.id;

        // 2. Create Teachers
        const teachers = await createTeachers(schoolId, 2);

        // 3. Create Teacher Commissions
        const allCommissions = [];
        for (const teacher of teachers) {
            const comms = await createDefaultTeacherCommissions(teacher.id);
            allCommissions.push(...comms);
        }

        // 4. Create Students
        const students = await createStudents(8);

        // 5. Associate Students with School
        await associateStudentsWithSchool(schoolId, students);

        // 6. Create Equipment
        const equipment = await createDefaultEquipment(schoolId);

        // 7. Create School Packages
        const packages = await createDefaultSchoolPackages(schoolId);

        // 8. Create Referrals
        await createDefaultReferrals(schoolId);

        // 9. Create Student Packages
        const studentPackages = await createStudentPackages(packages.map((p) => p.id));

        // 10. Create Bookings
        const bookingData = await createBookings(schoolId, students, studentPackages, packages);

        // 11. Link Students to Bookings
        await linkStudentsToBookings(bookingData);

        // 12. Create Lessons & Events
        const lessons = await createLessonsAndEvents(bookingData.bookings, teachers, allCommissions, schoolId, packages, equipment, studentPackages);

        // 13. Create Teacher Equipment Relations
        await createTeacherEquipmentRelations(teachers, equipment);

        // 14. Create Teacher Lesson Payments
        await createTeacherLessonPayments(lessons);

        // 15. Create Student Booking Payments
        await createStudentBookingPayments(bookingData.bookings, bookingData.studentMap);

        console.log("\n✨ Reva Kite School seed completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log("   Username: reva10");
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Bookings: ${bookingData.bookings.length}`);
        console.log(`   Equipment: ${equipment.length}`);
        console.log("   Ready for testing! ✅\n");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedRevaKiteSchool();
