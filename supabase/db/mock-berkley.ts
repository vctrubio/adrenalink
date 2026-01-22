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
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "berkley");

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
            name: "Berkley Wind Academy",
            username: "berkley",
            country: "USA",
            phone: "15105551234",
            status: "beta",
            currency: "USD",
            latitude: "37.8716",
            longitude: "-122.2727",
            timezone: "America/Los_Angeles",
            website_url: "https://berkleywindacademy.com",
            instagram_url: "https://instagram.com/berkleywindacademy",
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


        // 5. Create Bookings (today to 6 months ago)
        console.log("5️⃣  Creating bookings (today to 6 months ago)...");
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        
        const bookings = [];
        const bookingStudents = new Map();
        let bookingCount = 0;
        
        // Create bookings spread over 6 months
        // Each student gets 1 booking (usually, but can be group capacity)
        const totalDays = Math.floor((today.getTime() - sixMonthsAgo.getTime()) / (1000 * 60 * 60 * 24));
        
        for (const student of students) {
            // Each student gets 1 booking, randomly distributed over the 6 months
            const randomDayOffset = Math.floor(Math.random() * totalDays);
            const bookingDate = new Date(sixMonthsAgo);
            bookingDate.setDate(sixMonthsAgo.getDate() + randomDayOffset);
            
            // Pick a random package (can be group capacity)
            const pkg = packages[Math.floor(Math.random() * packages.length)];
            
            // Determine if this is a group booking (20% chance for group packages)
            const isGroup = pkg.capacity_students > 1 && Math.random() < 0.2;
            const studentIds = isGroup && pkg.capacity_students > 1
                ? [student.id, ...students.filter(s => s.id !== student.id).slice(0, pkg.capacity_students - 1).map(s => s.id)]
                : [student.id];
            
            const { data: bookingData, error: bookingError } = await supabase.from("booking").insert({
                school_id: schoolId,
                school_package_id: pkg.id,
                date_start: bookingDate.toISOString().slice(0, 10),
                date_end: bookingDate.toISOString().slice(0, 10),
                leader_student_name: `${student.first_name} ${student.last_name}`,
                status: "completed",
            }).select();
            if (bookingError || !bookingData || bookingData.length === 0) throw new Error("Failed to create booking");
            const booking = bookingData[0];
            bookings.push(booking);
            
            // Link all students to the booking
            for (const studentId of studentIds) {
                await supabase.from("booking_student").insert({ booking_id: booking.id, student_id: studentId });
            }
            bookingStudents.set(booking.id, studentIds);
            bookingCount++;
        }
        console.log(`✅ Created ${bookingCount} bookings from 6 months ago to today (all COMPLETED)`);


        // 6. Create Teacher-Equipment Relations (diverse, at least one per category)
        console.log("6️⃣  Creating teacher-equipment relations...");
        const categories = [...new Set(equipment.map(e => e.category))];
        const usedEquipment = new Set();
        const teacherEquipmentMap = new Map();
        for (const teacher of teachers) {
            const teacherEquip = [];
            for (const category of categories) {
                // Find an unused equipment of this category
                const eq = equipment.find(e => e.category === category && !usedEquipment.has(e.id));
                if (eq) {
                    await supabase.from("teacher_equipment").insert({
                        teacher_id: teacher.id,
                        equipment_id: eq.id,
                        active: true,
                    });
                    teacherEquip.push(eq.id);
                    usedEquipment.add(eq.id);
                }
            }
            teacherEquipmentMap.set(teacher.id, teacherEquip);
        }
        console.log("✅ Created diverse teacher-equipment relations");


        // 7. Create Lessons & Events
        console.log("7️⃣  Creating lessons and events...");
        const { lessons, events } = await createLessonsAndEvents(
            bookings,
            teachers,
            allCommissions,
            schoolId,
            packages,
            equipment,
            new Map(),
        );

        // 8. Add Equipment to Events (match category and assign properly)
        console.log("8️⃣  Adding equipment to events...");
        for (const event of events) {
            const lesson = lessons.find(l => l.id === event.lesson_id);
            if (!lesson) continue;
            
            // Get the package to find required category and capacity
            const booking = bookings.find(b => b.id === lesson.booking_id);
            if (!booking) continue;
            const pkg = packages.find(p => p.id === booking.school_package_id);
            if (!pkg) continue;
            
            const requiredCategory = pkg.category_equipment;
            const capacity = pkg.capacity_equipment;
            
            // Get teacher's equipment for this category
            const teacherEquipIds = teacherEquipmentMap.get(lesson.teacher_id) || [];
            const eligible = equipment.filter(e => 
                teacherEquipIds.includes(e.id) && e.category === requiredCategory
            );
            
            // If teacher doesn't have equipment of this category, find any equipment of this category
            const fallbackEligible = eligible.length === 0
                ? equipment.filter(e => e.category === requiredCategory)
                : eligible;
            
            // Assign up to capacity_equipment equipment to the event
            const equipmentToAssign = fallbackEligible.slice(0, Math.min(capacity, fallbackEligible.length));
            for (const eq of equipmentToAssign) {
                await supabase.from("equipment_event").insert({ 
                    equipment_id: eq.id, 
                    event_id: event.id 
                });
            }
        }
        console.log("✅ Added equipment to events by category");


        // 9. Create Student Feedback
        console.log("🔟 Creating student lesson feedback...");
        // Build bookingStudents map for feedback
        const bookingStudentsMap = new Map();
        for (const booking of bookings) {
            // Each booking is for one student
            const rels = await supabase.from("booking_student").select("student_id").eq("booking_id", booking.id);
            const studentIds = rels.data ? rels.data.map(r => r.student_id) : [];
            bookingStudentsMap.set(booking.id, studentIds);
        }
        await createStudentLessonFeedback(bookings, lessons, bookingStudentsMap);

        // 10. Create Teacher Payments
        console.log("1️⃣1️⃣  Creating teacher lesson payments...");
        await createTeacherLessonPayments(lessons, commissionMap, packageMap);

        // 11. Create Student Payments
        console.log("1️⃣2️⃣  Creating student booking payments...");
        await createStudentBookingPayments(bookings, bookingStudentsMap, packageMap);

        console.log("\n✨ Berkley Windsurf Academy FRESH seed completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log("   Username: berkley");
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Bookings: ${bookings.length} (6 months ago to today)`);
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
