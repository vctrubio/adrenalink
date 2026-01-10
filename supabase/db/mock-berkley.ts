/**
 * Mock Berkley Windsurf Academy - Complete Seed
 *
 * Comprehensive seeding flow:
 * 1. School setup with equipment_categories
 * 2. Teachers & Commissions
 * 3. Students & School Association
 * 4. Equipment (36 items: 12 windsurfs, 12 wings, 12 foils)
 * 5. School Packages (4 packages with student capacity)
 * 6. Student Packages
 * 7. Bookings (today to +3 days, respecting package capacity)
 * 8. Teacher-Equipment relations
 * 9. Lessons & Events (1 per booking, event duration from package)
 * 10. Equipment to Events (via teacher_equipment)
 * 11. Student Feedback
 * 12. Teacher & Student Payments
 *
 * Usage: bun supabase/db/mock-berkley.ts
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
    updateStudentPackageStatus,
    createLessonsAndEvents,
    addEquipmentToEvents,
    createStudentLessonFeedback,
    createTeacherLessonPayments,
    createStudentBookingPayments,
    supabase,
} from "../seeding/index";

const seedBerkleyWindsurfAcademyFresh = async () => {
    try {
        console.log("🌱 Starting Berkley Windsurf Academy FRESH Seed...\n");

        // Delete existing Berkley school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "berkley12");

        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Berkley school...\n");

            // Delete all related data in reverse dependency order
            const { data: bookings } = await supabase.from("booking").select("id").eq("school_id", schoolId);
            const bookingIds = bookings?.map((b) => b.id) || [];

            const { data: lessons } = await supabase.from("lesson").select("id").eq("school_id", schoolId);
            const lessonIds = lessons?.map((l) => l.id) || [];

            const { data: events } = await supabase.from("event").select("id").eq("school_id", schoolId);
            const eventIds = events?.map((e) => e.id) || [];

            const { data: teachers } = await supabase.from("teacher").select("id").eq("school_id", schoolId);
            const teacherIds = teachers?.map((t) => t.id) || [];

            const { data: equipmentRecords } = await supabase.from("equipment").select("id").eq("school_id", schoolId);
            const equipmentIds = equipmentRecords?.map((e) => e.id) || [];

            const { data: packages } = await supabase.from("school_package").select("id").eq("school_id", schoolId);
            const packageIds = packages?.map((p) => p.id) || [];

            // Delete in order
            if (bookingIds.length > 0) {
                await supabase.from("student_booking_payment").delete().in("booking_id", bookingIds);
                await supabase.from("booking_student").delete().in("booking_id", bookingIds);
            }
            if (eventIds.length > 0) {
                await supabase.from("equipment_event").delete().in("event_id", eventIds);
            }
            if (lessonIds.length > 0) {
                await supabase.from("teacher_lesson_payment").delete().in("lesson_id", lessonIds);
                await supabase.from("student_lesson_feedback").delete().in("lesson_id", lessonIds);
            }
            if (eventIds.length > 0) {
                await supabase.from("event").delete().in("id", eventIds);
            }
            if (lessonIds.length > 0) {
                await supabase.from("lesson").delete().in("id", lessonIds);
            }
            if (bookingIds.length > 0) {
                await supabase.from("booking").delete().in("id", bookingIds);
            }
            if (teacherIds.length > 0) {
                await supabase.from("teacher_equipment").delete().in("teacher_id", teacherIds);
                await supabase.from("teacher_commission").delete().in("teacher_id", teacherIds);
            }
            if (equipmentIds.length > 0) {
                await supabase.from("equipment_repair").delete().in("equipment_id", equipmentIds);
            }
            if (packageIds.length > 0) {
                await supabase.from("student_package").delete().in("school_package_id", packageIds);
                await supabase.from("school_package").delete().in("id", packageIds);
            }

            await supabase.from("rental_equipment").delete().in("equipment_id", equipmentIds);
            await supabase
                .from("rental_student")
                .delete()
                .in("rental_id", (await supabase.from("rental").select("id").eq("school_id", schoolId)).data?.map((r) => r.id) || []);
            await supabase.from("rental").delete().eq("school_id", schoolId);
            await supabase.from("referral").delete().eq("school_id", schoolId);
            await supabase.from("school_students").delete().eq("school_id", schoolId);
            if (equipmentIds.length > 0) {
                await supabase.from("equipment").delete().in("id", equipmentIds);
            }
            if (teacherIds.length > 0) {
                await supabase.from("teacher").delete().in("id", teacherIds);
            }
            await supabase.from("school_subscription").delete().eq("school_id", schoolId);
            await supabase.from("school").delete().eq("id", schoolId);

            console.log("✅ Cleaned up existing data\n");
        }

        // ========== SEEDING FLOW ==========

        // 1. Create School
        console.log("1️⃣  Creating school...");
        const school = await createSchool({
            name: "Berkley Windsurf Academy",
            username: "berkley12",
            country: "USA",
            phone: "15105551234",
            status: "beta",
            currency: "USD",
            latitude: "37.8716",
            longitude: "-122.2727",
            timezone: "America/Los_Angeles",
            website_url: "https://berkleywindsurf.com",
            instagram_url: "https://instagram.com/berkleywindsurf",
        });
        const schoolId = school.id;

        // Update school with equipment_categories
        await supabase.from("school").update({ equipment_categories: "windsurf,wing,foil" }).eq("id", schoolId);
        console.log("✅ Updated with equipment_categories: windsurf,wing,foil");

        // 2. Create Teachers & Commissions
        console.log("2️⃣  Creating teachers and commissions...");
        const teachers = await createTeachers(schoolId, 2);
        const allCommissions: any[] = [];
        const commissionMap = new Map<string, any>();
        for (const teacher of teachers) {
            const comms = await createDefaultTeacherCommissions(teacher.id);
            allCommissions.push(...comms);
            comms.forEach((c) => commissionMap.set(c.id, c));
        }

        // 3. Create Students & Associate
        console.log("3️⃣  Creating students...");
        const students = await createStudents(6);
        await associateStudentsWithSchool(schoolId, students);

        // 4. Create Equipment & Packages
        console.log("4️⃣  Creating equipment and school packages...");
        const equipment = await createDefaultEquipment(schoolId);
        const packages = await createDefaultSchoolPackages(schoolId);
        const packageMap = new Map<string, any>();
        packages.forEach((p) => packageMap.set(p.id, p));

        // 5. Create Student Packages
        console.log("5️⃣  Creating student packages...");
        const studentPackages = await createStudentPackages(packages.map((p) => p.id));

        // 6. Create Bookings (today to +3 days) & Update Package Status
        console.log("6️⃣  Creating bookings (today to +3 days)...");
        const bookingData = await createBookings(schoolId, students, studentPackages, packages);
        await linkStudentsToBookings(bookingData);
        await updateStudentPackageStatus(bookingData.studentPackageMap);

        // 7. Create Teacher-Equipment Relations
        console.log("7️⃣  Creating teacher-equipment relations...");
        const teacherEquipmentMap = new Map<string, string[]>();
        for (const teacher of teachers) {
            const equipmentIds = equipment.slice(0, 2).map((e) => e.id);
            for (const equipmentId of equipmentIds) {
                await supabase.from("teacher_equipment").insert({
                    teacher_id: teacher.id,
                    equipment_id: equipmentId,
                    active: true,
                });
            }
            teacherEquipmentMap.set(teacher.id, equipmentIds);
        }
        console.log(`✅ Created ${teachers.length * 2} teacher-equipment relations`);

        // 8. Create Lessons & Events
        console.log("8️⃣  Creating lessons and events...");
        const { lessons, events } = await createLessonsAndEvents(
            bookingData.bookings,
            teachers,
            allCommissions,
            schoolId,
            packages,
            equipment,
            bookingData.studentPackageMap,
        );

        // 9. Add Equipment to Events
        console.log("9️⃣  Adding equipment to events...");
        await addEquipmentToEvents(events, lessons, teachers, teacherEquipmentMap);

        // 10. Create Student Feedback
        console.log("🔟 Creating student lesson feedback...");
        await createStudentLessonFeedback(bookingData.bookings, lessons, bookingData.studentMap);

        // 11. Create Teacher Payments
        console.log("1️⃣1️⃣  Creating teacher lesson payments...");
        await createTeacherLessonPayments(lessons, commissionMap, packageMap);

        // 12. Create Student Payments
        console.log("1️⃣2️⃣  Creating student booking payments...");
        await createStudentBookingPayments(bookingData.bookings, bookingData.studentMap, packageMap);

        console.log("\n✨ Berkley Windsurf Academy FRESH seed completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log("   Username: berkley12");
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Bookings: ${bookingData.bookings.length} (today to +3 days)`);
        console.log(`   Lessons: ${lessons.length} (1 per booking)`);
        console.log(`   Events: ${events.length}`);
        console.log(`   Equipment: ${equipment.length}`);
        console.log("   All payments and relationships created! ✅\n");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedBerkleyWindsurfAcademyFresh().then(() => {
    console.log("✨ Done! Exiting...");
    process.exit(0);
});
