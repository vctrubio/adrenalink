/**
 * Mock Simple Seed - Berkley Windsurf Academy
 *
 * Seeds:
 * 1. School setup
 * 2. Teachers & Commissions
 * 3. Students & School Association
 * 4. Equipment
 * 5. School Packages
 * 
 * NO Bookings, NO Lessons, NO Events.
 * 
 * Usage: npx ts-node supabase/db/mock-simple.ts
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    associateStudentsWithSchool,
    createDefaultEquipment,
    createDefaultSchoolPackages,
    supabase,
} from "../seeding/index";

const seedSimpleFresh = async () => {
    try {
        console.log("🌱 Starting Simple FRESH Seed (Santa Barbara)...\n");

        // Delete existing Santa Barbara school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "sb_surf");

        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Santa Barbara school...\n");

            // ... (deletion logic remains the same, targeting this schoolId)
            // Delete in reverse dependency order
            await supabase.from("rental_equipment").delete().filter("rental_id", "in", 
                supabase.from("rental").select("id").eq("school_id", schoolId)
            );
            await supabase.from("rental_student").delete().filter("rental_id", "in", 
                supabase.from("rental").select("id").eq("school_id", schoolId)
            );
            await supabase.from("rental").delete().eq("school_id", schoolId);
            
            // Delete bookings and related
            const { data: bookings } = await supabase.from("booking").select("id").eq("school_id", schoolId);
            const bookingIds = bookings?.map((b) => b.id) || [];
            if (bookingIds.length > 0) {
                await supabase.from("student_booking_payment").delete().in("booking_id", bookingIds);
                await supabase.from("booking_student").delete().in("booking_id", bookingIds);
            }

            // Delete events and related
            const { data: events } = await supabase.from("event").select("id").eq("school_id", schoolId);
            const eventIds = events?.map((e) => e.id) || [];
            if (eventIds.length > 0) {
                await supabase.from("equipment_event").delete().in("event_id", eventIds);
                await supabase.from("event").delete().in("id", eventIds);
            }

            // Delete lessons and related
            const { data: lessons } = await supabase.from("lesson").select("id").eq("school_id", schoolId);
            const lessonIds = lessons?.map((l) => l.id) || [];
            if (lessonIds.length > 0) {
                await supabase.from("teacher_lesson_payment").delete().in("lesson_id", lessonIds);
                await supabase.from("student_lesson_feedback").delete().in("lesson_id", lessonIds);
                await supabase.from("lesson").delete().in("id", lessonIds);
            }

            if (bookingIds.length > 0) {
                await supabase.from("booking").delete().in("id", bookingIds);
            }

            // Delete teachers and related
            const { data: teachers } = await supabase.from("teacher").select("id").eq("school_id", schoolId);
            const teacherIds = teachers?.map((t) => t.id) || [];
            if (teacherIds.length > 0) {
                await supabase.from("teacher_equipment").delete().in("teacher_id", teacherIds);
                await supabase.from("teacher_commission").delete().in("teacher_id", teacherIds);
                await supabase.from("teacher").delete().in("id", teacherIds);
            }

            // Delete equipment and related
            const { data: equipmentRecords } = await supabase.from("equipment").select("id").eq("school_id", schoolId);
            const equipmentIds = equipmentRecords?.map((e) => e.id) || [];
            if (equipmentIds.length > 0) {
                await supabase.from("equipment_repair").delete().in("equipment_id", equipmentIds);
                await supabase.from("equipment").delete().in("id", equipmentIds);
            }

            // Delete packages
            const { data: packages } = await supabase.from("school_package").select("id").eq("school_id", schoolId);
            const packageIds = packages?.map((p) => p.id) || [];
            if (packageIds.length > 0) {
                await supabase.from("student_package").delete().in("school_package_id", packageIds);
                await supabase.from("school_package").delete().in("id", packageIds);
            }

            await supabase.from("referral").delete().eq("school_id", schoolId);
            await supabase.from("school_students").delete().eq("school_id", schoolId);
            await supabase.from("school_subscription").delete().eq("school_id", schoolId);
            await supabase.from("school").delete().eq("id", schoolId);

            console.log("✅ Cleaned up existing data\n");
        }

        // ========== SEEDING FLOW ==========

        // 1. Create School
        console.log("1️⃣  Creating school...");
        const school = await createSchool({
            name: "Santa Barbara Surf Center",
            username: "sb_surf",
            country: "USA",
            phone: "18055559876",
            status: "beta",
            currency: "USD",
            latitude: "34.4208",
            longitude: "-119.6982",
            timezone: "America/Los_Angeles",
            website_url: "https://sbsurf.com",
            instagram_url: "https://instagram.com/sbsurf",
            email: "admin@sbsurf.com",
            clerk_id: "user_sb_admin"
        });
        const schoolId = school.id;

        // Update school with equipment_categories
        await supabase.from("school").update({ equipment_categories: "surf,sup,foil" }).eq("id", schoolId);
        console.log("✅ Updated with equipment_categories: surf,sup,foil");

        // 2. Create Teachers & Commissions
        console.log("2️⃣  Creating teachers and commissions...");
        const teachers = await createTeachers(schoolId, 3); // 3 Teachers
        for (const teacher of teachers) {
            await createDefaultTeacherCommissions(teacher.id);
        }

        // 3. Create Students & Associate
        console.log("3️⃣  Creating students...");
        const students = await createStudents(10); // 10 Students
        await associateStudentsWithSchool(schoolId, students);

        // 4. Create Equipment & Packages
        console.log("4️⃣  Creating equipment and school packages...");
        await createDefaultEquipment(schoolId);
        await createDefaultSchoolPackages(schoolId);

        console.log("\n✨ Simple seed (Santa Barbara) completed successfully!");
        console.log(`   School: Santa Barbara Surf Center`);
        console.log(`   Username: sb_surf`);
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log("   No bookings or lessons created. ✅\n");
    } catch (error) {        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedSimpleFresh().then(() => {
    console.log("✨ Done! Exiting...");
    process.exit(0);
});
