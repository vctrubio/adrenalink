/**
 * Mock Tenerife Kite School - Complete Seed
 * 
 * Comprehensive seeding flow:
 * 1. School setup with equipment_categories
 * 2. Teachers & Commissions
 * 3. Students & School Association (rental: false default)
 * 4. Equipment (5 kites, 5 wings, 5 windsurfs)
 * 5. School Packages
 * 6. 100 Bookings (last year to today, spread out)
 * 7. Lessons (1-3 per booking)
 * 8. Events (1 per lesson, spread over consecutive days)
 * 9. Statuses set to 'completed'
 * 10. Payments generated
 *
 * Usage: bun supabase/db/mock-tenerife.ts
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    supabase,
} from "../seeding/index";
import { faker } from "@faker-js/faker";

const associateStudentsWithSchoolCustom = async (schoolId: string, students: any[]): Promise<void> => {
    const relations = students.map((student) => ({
        school_id: schoolId,
        student_id: student.id,
        description: faker.lorem.sentence(),
        active: true,
        rental: false, // Per user request: default is false for rental
    }));

    const { error } = await supabase.from("school_students").insert(relations);
    if (error) throw error;
    console.log(`✅ Associated ${students.length} students with school (rental: false)`);
};

const seedTenerifeKiteSchoolFresh = async () => {
    try {
        console.log("🌱 Starting Tenerife Kite Academy FRESH Seed...\n");

        // 1. Delete existing Tenerife school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "tenerife");

        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Tenerife school data...");

            // Delete in reverse dependency order
            const { data: lessonsData } = await supabase.from("lesson").select("id").eq("school_id", schoolId);
            const lessonIds = lessonsData?.map(l => l.id) || [];
            
            const { data: bookingsData } = await supabase.from("booking").select("id").eq("school_id", schoolId);
            const bookingIds = bookingsData?.map(b => b.id) || [];
            
            const { data: eventsData } = await supabase.from("event").select("id").eq("school_id", schoolId);
            const eventIds = eventsData?.map(e => e.id) || [];
            
            const { data: teachersData } = await supabase.from("teacher").select("id").eq("school_id", schoolId);
            const teacherIds = teachersData?.map(t => t.id) || [];
            
            const { data: equipmentData } = await supabase.from("equipment").select("id").eq("school_id", schoolId);
            const equipmentIds = equipmentData?.map(e => e.id) || [];
            
            const { data: packagesData } = await supabase.from("school_package").select("id").eq("school_id", schoolId);
            const packageIds = packagesData?.map(p => p.id) || [];

            if (lessonIds.length > 0) {
                await supabase.from("teacher_lesson_payment").delete().in("lesson_id", lessonIds);
                await supabase.from("student_lesson_feedback").delete().in("lesson_id", lessonIds);
            }
            if (bookingIds.length > 0) {
                await supabase.from("student_booking_payment").delete().in("booking_id", bookingIds);
                await supabase.from("booking_student").delete().in("booking_id", bookingIds);
            }
            if (eventIds.length > 0) {
                await supabase.from("equipment_event").delete().in("event_id", eventIds);
            }
            
            await supabase.from("event").delete().eq("school_id", schoolId);
            await supabase.from("lesson").delete().eq("school_id", schoolId);
            await supabase.from("booking").delete().eq("school_id", schoolId);
            
            if (teacherIds.length > 0) {
                await supabase.from("teacher_equipment").delete().in("teacher_id", teacherIds);
                await supabase.from("teacher_commission").delete().in("teacher_id", teacherIds);
            }
            if (equipmentIds.length > 0) {
                await supabase.from("equipment_repair").delete().in("equipment_id", equipmentIds);
            }
            
            await supabase.from("equipment").delete().eq("school_id", schoolId);
            
            if (packageIds.length > 0) {
                await supabase.from("student_package").delete().in("school_package_id", packageIds);
            }
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
            name: "Tenerife Kite Academy",
            username: "tenerife",
            country: "Spain",
            phone: "+34922123456",
            status: "beta",
            currency: "EUR",
            latitude: "28.0473",
            longitude: "-16.5362",
            timezone: "Atlantic/Canary",
            website_url: "https://tenerifekite.com",
            instagram_url: "https://instagram.com/tenerifekite",
            clerk_id: "user_tenerife_owner_mock_id",
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
        await associateStudentsWithSchoolCustom(schoolId, students);

        // 5. Create Equipment (5 per category)
        console.log("4️⃣  Creating equipment (5 per category) and linking to teachers...");
        const categories = ["kite", "wing", "windsurf"];
        const northModels: Record<string, string[]> = {
            kite: ["Orbit", "Reach", "Pulse", "Carve", "Code Zero"],
            wing: ["Nova", "Mode", "Loft", "Nova Light Wind"],
            windsurf: ["Wave", "X-Over", "Free", "Slalom"]
        };

        const equipmentRecords = [];
        for (const category of categories) {
            const models = northModels[category] || ["Standard"];
            for (let i = 0; i < 5; i++) {
                equipmentRecords.push({
                    sku: `TF-${category.toUpperCase()}-${(i + 1).toString().padStart(3, '0')}`,
                    brand: "North",
                    model: models[i % models.length],
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

        // Link equipment to teachers
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
            { description: "Pro Kite Session", duration_minutes: 120, price_per_student: 180, capacity_students: 1, capacity_equipment: 1, category_equipment: "kite", package_type: "lessons", school_id: schoolId },
            { description: "Wing Duo Lesson", duration_minutes: 150, price_per_student: 130, capacity_students: 2, capacity_equipment: 2, category_equipment: "wing", package_type: "lessons", school_id: schoolId },
            { description: "Windsurf Masterclass", duration_minutes: 180, price_per_student: 220, capacity_students: 1, capacity_equipment: 1, category_equipment: "windsurf", package_type: "lessons", school_id: schoolId },
            { description: "Family Wing Fun", duration_minutes: 120, price_per_student: 90, capacity_students: 4, capacity_equipment: 4, category_equipment: "wing", package_type: "lessons", school_id: schoolId },
        ];
        const { data: packages } = await supabase.from("school_package").insert(packageRecords).select();
        if (!packages) throw new Error("Failed to create packages");

        // 7. Create 100 Bookings spread over last MONTH (Fresh data)
        // AND only use half of the students (the other half remain with no bookings)
        console.log("6️⃣  Creating 100 bookings spread over the last month...");
        const bookingRecords = [];
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const bookingStudents = students.slice(0, Math.floor(students.length / 2));
        console.log(`   (Using ${bookingStudents.length} students for bookings, ${students.length - bookingStudents.length} will have none)`);

        for (let i = 0; i < 100; i++) {
            const pkg = faker.helpers.arrayElement(packages);
            const bookingDate = faker.date.between({ from: oneMonthAgo, to: now });
            const dateStr = bookingDate.toISOString().split('T')[0];
            
            const selectedStudents = faker.helpers.arrayElements(bookingStudents, pkg.capacity_students);
            if (selectedStudents.length === 0) continue;
            
            bookingRecords.push({
                school_id: schoolId,
                school_package_id: pkg.id,
                date_start: dateStr,
                date_end: dateStr,
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

            await supabase.from("booking_student").insert(
                _selectedStudents.map(s => ({ booking_id: bRes.id, student_id: s.id }))
            );

            // 8. Create 1-5 Events per booking, grouped by teacher into Lessons
            const numEvents = faker.number.int({ min: 1, max: 5 });
            const pkg = packages.find(p => p.id === bRes.school_package_id)!;
            
            let currentTeacher = faker.helpers.arrayElement(teachers);
            let currentCommission = teacherCommissions.find(c => c.teacher_id === currentTeacher.id)!;
            let currentLesson: any = null;
            let lastDate = new Date(bRes.date_start);

            for (let eIdx = 0; eIdx < numEvents; eIdx++) {
                // 3/10 probability of changing teacher for this event
                if (eIdx > 0 && Math.random() < 0.3) {
                    currentTeacher = faker.helpers.arrayElement(teachers);
                    currentCommission = teacherCommissions.find(c => c.teacher_id === currentTeacher.id)!;
                    currentLesson = null; // Force new lesson
                }

                if (!currentLesson) {
                    const { data: lesson } = await supabase.from("lesson").insert({
                        school_id: schoolId,
                        teacher_id: currentTeacher.id,
                        booking_id: bRes.id,
                        commission_id: currentCommission.id,
                        status: "completed"
                    }).select().single();
                    currentLesson = lesson;
                }

                if (!currentLesson) continue;

                // 9. Create Event
                const eventDate = new Date(bRes.date_start);
                eventDate.setDate(eventDate.getDate() + eIdx);
                eventDate.setHours(9 + eIdx, 30, 0, 0); // 9:30 AM, 10:30 AM etc.
                
                if (eventDate > lastDate) lastDate = eventDate;

                const { data: event } = await supabase.from("event").insert({
                    school_id: schoolId,
                    lesson_id: currentLesson.id,
                    date: eventDate.toISOString(),
                    duration: pkg.duration_minutes,
                    location: "El Medano Shore",
                    status: "completed"
                }).select().single();

                if (!event) continue;

                // Link equipment
                const eligibleEq = equipment.filter(e => e.category === pkg.category_equipment);
                const assignedEq = faker.helpers.arrayElements(eligibleEq, Math.min(pkg.capacity_equipment, eligibleEq.length));
                await supabase.from("equipment_event").insert(
                    assignedEq.map(eq => ({ event_id: event.id, equipment_id: eq.id }))
                );

                // Create Feedback
                await supabase.from("student_lesson_feedback").insert(
                    _selectedStudents.map(s => ({
                        student_id: s.id,
                        lesson_id: currentLesson.id,
                        feedback: faker.helpers.arrayElement([
                            "Excellent session!", "Highly recommended.", "Learned a lot.",
                            "Wind was great.", "Patient instructor.", "Will come back!"
                        ])
                    }))
                );

                // Create Teacher Payment
                const rate = parseFloat(currentCommission.cph) || 25;
                const amount = (pkg.duration_minutes / 60) * rate;
                await supabase.from("teacher_lesson_payment").insert({
                    lesson_id: currentLesson.id,
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
                    amount: pkg.price_per_student * numEvents
                }))
            );
        }

        console.log("\n✨ Tenerife Kite Academy FRESH seed completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Bookings: 100 (Last 1 month)`);
        console.log("   All statuses COMPLETED and payments created! ✅\n");

    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedTenerifeKiteSchoolFresh().then(() => {
    console.log("✨ Done! Exiting...");
    process.exit(0);
});