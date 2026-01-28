/**
 * Mock Berkley Windsurf Academy - Complete Seed
 * 
 * Comprehensive seeding flow:
 * 1. School setup with equipment_categories
 * 2. Teachers & Commissions
 * 3. Students & School Association
 * 4. Equipment (5 kites, 5 wings, 5 windsurfs)
 * 5. School Packages
 * 6. 100 Bookings (last year to today, spread out)
 * 7. Lessons (1-3 per booking)
 * 8. Events (1 per lesson, spread over consecutive days)
 * 9. Statuses set to 'completed'
 * 10. Payments generated
 *
 * Usage: bun supabase/db/mock-berkley.ts
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    associateStudentsWithSchool,
    supabase,
} from "../seeding/index";
import { faker } from "@faker-js/faker";

const seedBerkleyWindsurfAcademyFresh = async () => {
    try {
        console.log("🌱 Starting Berkley Windsurf Academy FRESH Seed...\n");

        // 1. Delete existing Berkley school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "berkley");

        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Berkley school data...");

            // Helper to delete by school_id
            const tablesToDelete = [
                "teacher_lesson_payment", "student_booking_payment", "student_lesson_feedback",
                "equipment_event", "event", "lesson", "booking_student", "booking",
                "teacher_equipment", "teacher_commission", "equipment_repair", "equipment",
                "student_package", "school_package", "rental_equipment", "rental_student",
                "rental", "referral", "school_students", "teacher"
            ];

            // Some tables don't have school_id directly or need special handling
            // For simplicity in mock script, we assume cascading or we delete in order
            
            // Delete in reverse dependency order
            await supabase.from("teacher_lesson_payment").delete().filter("lesson_id", "in", 
                (await supabase.from("lesson").select("id").eq("school_id", schoolId)).data?.map(l => l.id) || []
            );
            await supabase.from("student_booking_payment").delete().filter("booking_id", "in", 
                (await supabase.from("booking").select("id").eq("school_id", schoolId)).data?.map(b => b.id) || []
            );
            await supabase.from("student_lesson_feedback").delete().filter("lesson_id", "in", 
                (await supabase.from("lesson").select("id").eq("school_id", schoolId)).data?.map(l => l.id) || []
            );
            await supabase.from("equipment_event").delete().filter("event_id", "in", 
                (await supabase.from("event").select("id").eq("school_id", schoolId)).data?.map(e => e.id) || []
            );
            await supabase.from("event").delete().eq("school_id", schoolId);
            await supabase.from("lesson").delete().eq("school_id", schoolId);
            await supabase.from("booking_student").delete().filter("booking_id", "in", 
                (await supabase.from("booking").select("id").eq("school_id", schoolId)).data?.map(b => b.id) || []
            );
            await supabase.from("booking").delete().eq("school_id", schoolId);
            await supabase.from("teacher_equipment").delete().filter("teacher_id", "in", 
                (await supabase.from("teacher").select("id").eq("school_id", schoolId)).data?.map(t => t.id) || []
            );
            await supabase.from("teacher_commission").delete().filter("teacher_id", "in", 
                (await supabase.from("teacher").select("id").eq("school_id", schoolId)).data?.map(t => t.id) || []
            );
            await supabase.from("equipment_repair").delete().filter("equipment_id", "in", 
                (await supabase.from("equipment").select("id").eq("school_id", schoolId)).data?.map(e => e.id) || []
            );
            await supabase.from("equipment").delete().eq("school_id", schoolId);
            await supabase.from("student_package").delete().filter("school_package_id", "in", 
                (await supabase.from("school_package").select("id").eq("school_id", schoolId)).data?.map(p => p.id) || []
            );
            await supabase.from("school_package").delete().eq("school_id", schoolId);
            await supabase.from("rental").delete().eq("school_id", schoolId);
            await supabase.from("referral").delete().eq("school_id", schoolId);
            await supabase.from("school_students").delete().eq("school_id", schoolId);
            await supabase.from("teacher").delete().eq("school_id", schoolId);
            await supabase.from("school").delete().eq("id", schoolId);

            console.log("✅ Cleaned up existing data\n");
        }

        // 2. Create School
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
            clerk_id: process.env.VCTRUBIO_CLERK_ID_TESTER || "user_38iCzHCmEjbDcCKyfea25PhakbM",
        });
        const schoolId = school.id;
        await supabase.from("school").update({ equipment_categories: "kite,wing,windsurf" }).eq("id", schoolId);

        // 3. Create Teachers & Commissions
        console.log("2️⃣  Creating 5 teachers and commissions...");
        const teachers = await createTeachers(schoolId, 5);
        const teacherCommissions = [];
        for (const t of teachers) {
            const comms = await createDefaultTeacherCommissions(t.id);
            teacherCommissions.push(...comms);
        }

        // 4. Create Students
        console.log("3️⃣  Creating 50 students...");
        const students = await createStudents(50);
        await associateStudentsWithSchool(schoolId, students);

        // 5. Create Equipment (5 per category) and linking to teachers...
        console.log("4️⃣  Creating equipment (5 per category) and linking to teachers...");
        const categories = ["kite", "wing", "windsurf"];
        const equipmentRecords = [];
        for (const category of categories) {
            for (let i = 1; i <= 5; i++) {
                equipmentRecords.push({
                    sku: `${category.toUpperCase()}-${i.toString().padStart(3, '0')}`,
                    brand: faker.helpers.arrayElement(["Duotone", "North", "Naish", "F-One"]),
                    model: faker.word.noun(),
                    color: faker.color.human(),
                    size: category === "kite" ? faker.number.int({ min: 7, max: 14 }) : faker.number.float({ min: 3.5, max: 6.0, fractionDigits: 1 }),
                    category,
                    status: "public",
                    school_id: schoolId
                });
            }
        }
        const { data: equipment } = await supabase.from("equipment").insert(equipmentRecords).select();
        if (!equipment) throw new Error("Failed to create equipment");

        // Link equipment to teachers (randomly)
        const teacherEquipmentRelations = [];
        for (const t of teachers) {
            const selectedEq = faker.helpers.arrayElements(equipment, 3);
            for (const eq of selectedEq) {
                teacherEquipmentRelations.push({
                    teacher_id: t.id,
                    equipment_id: eq.id,
                    active: true
                });
            }
        }
        await supabase.from("teacher_equipment").insert(teacherEquipmentRelations);

        // 6. Create School Packages
        console.log("5️⃣  Creating school packages...");
        const packageRecords = [
            { description: "Kite Beginner Pack", duration_minutes: 120, price_per_student: 150, capacity_students: 1, capacity_equipment: 1, category_equipment: "kite", package_type: "lessons", school_id: schoolId },
            { description: "Wing Discovery", duration_minutes: 150, price_per_student: 120, capacity_students: 2, capacity_equipment: 2, category_equipment: "wing", package_type: "lessons", school_id: schoolId },
            { description: "Windsurf Advanced", duration_minutes: 180, price_per_student: 200, capacity_students: 1, capacity_equipment: 1, category_equipment: "windsurf", package_type: "lessons", school_id: schoolId },
            { description: "Group Wing Clinic", duration_minutes: 120, price_per_student: 100, capacity_students: 3, capacity_equipment: 3, category_equipment: "wing", package_type: "lessons", school_id: schoolId },
        ];
        const { data: packages } = await supabase.from("school_package").insert(packageRecords).select();
        if (!packages) throw new Error("Failed to create packages");

        // 7. Create 100 Bookings spread over last year
        console.log("6️⃣  Creating 100 bookings spread over last year...");
        const bookingRecords = [];
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        for (let i = 0; i < 100; i++) {
            const pkg = faker.helpers.arrayElement(packages);
            const bookingDate = faker.date.between({ from: oneYearAgo, to: now });
            const dateStr = bookingDate.toISOString().split('T')[0];
            
            // Random students for booking
            const selectedStudents = faker.helpers.arrayElements(students, pkg.capacity_students);
            
            bookingRecords.push({
                school_id: schoolId,
                school_package_id: pkg.id,
                date_start: dateStr,
                date_end: dateStr, // Will update after adding lessons
                leader_student_name: `${selectedStudents[0].first_name} ${selectedStudents[0].last_name}`,
                status: "completed",
                _selectedStudents: selectedStudents
            });
        }

        // Insert bookings and handle lessons/events
        for (const bData of bookingRecords) {
            const { _selectedStudents, ...bookingPayload } = bData;
            const { data: bRes } = await supabase.from("booking").insert(bookingPayload).select().single();
            if (!bRes) continue;

            // Link students
            await supabase.from("booking_student").insert(
                _selectedStudents.map(s => ({ booking_id: bRes.id, student_id: s.id }))
            );

            // 8. Create 1-3 Lessons per booking
            const numLessons = faker.number.int({ min: 1, max: 3 });
            const teacher = faker.helpers.arrayElement(teachers);
            const commission = teacherCommissions.find(c => c.teacher_id === teacher.id);
            const pkg = packages.find(p => p.id === bRes.school_package_id)!;

            let lastDate = new Date(bRes.date_start);

            for (let lIdx = 0; lIdx < numLessons; lIdx++) {
                const { data: lesson } = await supabase.from("lesson").insert({
                    school_id: schoolId,
                    teacher_id: teacher.id,
                    booking_id: bRes.id,
                    commission_id: commission.id,
                    status: "completed"
                }).select().single();

                if (!lesson) continue;

                // 9. Create 1 Event per lesson (consecutive days)
                const eventDate = new Date(bRes.date_start);
                eventDate.setDate(eventDate.getDate() + lIdx);
                // Set fixed time 10:00 AM for consistency
                eventDate.setHours(10 + lIdx, 0, 0, 0); // Stagger times slightly if multiple events in a day? No, consecutive days.
                
                if (eventDate > lastDate) lastDate = eventDate;

                const { data: event } = await supabase.from("event").insert({
                    school_id: schoolId,
                    lesson_id: lesson.id,
                    date: eventDate.toISOString(),
                    duration: pkg.duration_minutes,
                    location: "Berkley Shore",
                    status: "completed"
                }).select().single();

                if (!event) continue;

                // Link equipment to event
                const eligibleEq = equipment.filter(e => e.category === pkg.category_equipment);
                const assignedEq = faker.helpers.arrayElements(eligibleEq, pkg.capacity_equipment);
                await supabase.from("equipment_event").insert(
                    assignedEq.map(eq => ({ event_id: event.id, equipment_id: eq.id }))
                );

                // Create Feedback
                await supabase.from("student_lesson_feedback").insert(
                    _selectedStudents.map(s => ({
                        student_id: s.id,
                        lesson_id: lesson.id,
                        feedback: faker.helpers.arrayElement([
                            "Great lesson!", "Amazing progress today.", "Teacher was very patient.",
                            "Conditions were perfect.", "Hard but fun.", "I love this sport!"
                        ])
                    }))
                );

                // Create Teacher Payment
                // Simple calculation: duration * rate (if fixed) or base
                const rate = parseFloat(commission.cph) || 20;
                const amount = (pkg.duration_minutes / 60) * rate;
                await supabase.from("teacher_lesson_payment").insert({
                    lesson_id: lesson.id,
                    amount: Math.round(amount)
                });
            }

            // Update booking end date
            await supabase.from("booking").update({ 
                date_end: lastDate.toISOString().split('T')[0] 
            }).eq("id", bRes.id);

            // 11. Create Student Payments
            await supabase.from("student_booking_payment").insert(
                _selectedStudents.map(s => ({
                    booking_id: bRes.id,
                    student_id: s.id,
                    amount: pkg.price_per_student * numLessons
                }))
            );
        }

        console.log("\n✨ Berkley Windsurf Academy FRESH seed completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Bookings: 100 (Last 1 year)`);
        console.log("   All statuses COMPLETED and payments created! ✅\n");

    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedBerkleyWindsurfAcademyFresh().then(() => {
    console.log("✨ Done! Exiting...");
    process.exit(0);
});