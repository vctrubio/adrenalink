/**
 * Mock Master School Seed (Plymouth)
 *
 * Seeds:
 * 1. School setup (Plymouth)
 * 2. 8 Teachers & 2 commission types per teacher
 * 3. Many students (max 2 bookings per student)
 * 4. Equipment
 * 5. School Packages
 * 6. 40 Bookings (spread over last 6 months)
 * 7. Lessons & Events (spread, not all in one day)
 *
 * Usage: bun supabase/db/mock-master.ts
 */

import {
    createSchool,
    createTeachers,
    createTeacherCommissions,
    createStudents,
    createDefaultEquipment,
    createDefaultSchoolPackages,
    createBookings,
    linkStudentsToBookings,
    createLessonsAndEvents,
    supabase,
} from "../seeding/index";

const seedMasterSchool = async () => {
    try {
        console.log("🌱 Starting Master School Seed (Plymouth)...\n");

        // Delete existing Master school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "master");
        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Master school...\n");
            // ... thorough deletion logic as in other scripts ...
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
        }

        // 1. Create School
        const school = await createSchool({
            name: "Master Kite School",
            username: "master",
            country: "UK",
            phone: "+441752000000",
            status: "beta",
            currency: "GBP",
            latitude: "50.3755",
            longitude: "-4.1427",
            timezone: "Europe/London",
            website_url: "https://plymouthkiteschool.com",
            instagram_url: "https://instagram.com/plymouthkiteschool",
        });
        const schoolId = school.id;

        // 2. Create Teachers
        const teachers = await createTeachers(schoolId, 8);
        // 2 commission types per teacher
        for (const teacher of teachers) {
            await createTeacherCommissions(teacher.id, [
                { commission_type: "percentage", cph: "30.00", description: "Standard" },
                { commission_type: "fixed", cph: "18.00", description: "Supervision" },
            ]);
        }

        // 3. Create Students
        const students = await createStudents(30);
        // Associate all students with the school
        if (students && students.length > 0) {
            const relations = students.map((student) => ({
                school_id: schoolId,
                student_id: student.id,
                description: "",
                active: true,
                rental: true,
            }));
            await supabase.from("school_students").insert(relations);
        }

        // 4. Create Equipment
        const equipment = await createDefaultEquipment(schoolId);

        // 5. Create School Packages
        let packages = await createDefaultSchoolPackages(schoolId);
        if (!Array.isArray(packages)) {
            packages = packages?.packages || packages?.data || [];
        }

        // 5. Create Bookings (spread over 6 months, max 2 per student)
        const today = new Date();
        const bookings = [];
        const bookingStudents = new Map();
        const studentBookingCount = {};
        let bookingCount = 0;
        while (bookingCount < 50) {
            const pkg = packages[bookingCount % packages.length];
            // Random date in last 6 months
            const daysAgo = Math.floor(Math.random() * 180);
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);
            // Find a student with less than 2 bookings
            const availableStudent = students.find(s => (studentBookingCount[s.id] || 0) < 2);
            if (!availableStudent) break;
            const { data: bookingData, error: bookingError } = await supabase.from("booking").insert({
                school_id: schoolId,
                school_package_id: pkg.id,
                date_start: date.toISOString().slice(0, 10),
                date_end: date.toISOString().slice(0, 10),
                leader_student_name: `${availableStudent.first_name} ${availableStudent.last_name}`,
                status: "completed",
            }).select();
            if (bookingError || !bookingData || bookingData.length === 0) throw new Error("Failed to create booking");
            const booking = bookingData[0];
            bookings.push(booking);
            await supabase.from("booking_student").insert({ booking_id: booking.id, student_id: availableStudent.id });
            bookingStudents.set(booking.id, [availableStudent.id]);
            studentBookingCount[availableStudent.id] = (studentBookingCount[availableStudent.id] || 0) + 1;
            bookingCount++;
        }
        console.log(`✅ Created ${bookingCount} bookings over last 6 months (all COMPLETED)`);

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

        // 7. Create Lessons & Events (guaranteed per booking)
        console.log("7️⃣  Creating lessons and events (guaranteed per booking)...");
        const lessons = [];
        const events = [];
        for (const booking of bookings) {
            // Pick a random teacher for the lesson
            const teacher = teachers[Math.floor(Math.random() * teachers.length)];
            // Find the package for this booking
            const pkg = packages.find(p => p.id === booking.school_package_id);
            const category = pkg ? pkg.category_equipment : "kite";
            // Find a commission for this teacher
            const { data: commissions, error: commError } = await supabase.from("teacher_commission").select("id").eq("teacher_id", teacher.id);
            if (commError || !commissions || commissions.length === 0) throw new Error("No commission for teacher");
            const commission_id = commissions[0].id;
            // Create lesson
            const { data: lessonData, error: lessonError } = await supabase.from("lesson").insert({
                school_id: schoolId,
                teacher_id: teacher.id,
                booking_id: booking.id,
                commission_id,
                status: "completed",
            }).select();
            if (lessonError || !lessonData || lessonData.length === 0) throw new Error("Failed to create lesson");
            const lesson = lessonData[0];
            lessons.push(lesson);
            // Create event
            const { data: eventData, error: eventError } = await supabase.from("event").insert({
                school_id: schoolId,
                lesson_id: lesson.id,
                date: booking.date_start,
                duration: pkg && pkg.duration_minutes ? pkg.duration_minutes : 60,
                location: "Plymouth Beach",
                status: "completed",
            }).select();
            if (eventError || !eventData || eventData.length === 0) throw new Error("Failed to create event");
            const event = eventData[0];
            events.push(event);
            // Assign equipment to event
            const capacity = pkg ? pkg.capacity_equipment : 1;
            // Gather all eligible equipment (from all teachers) for this category
            const eligible = [];
            for (const eqIds of teacherEquipmentMap.values()) {
                for (const id of eqIds) {
                    const eq = equipment.find(e => e.id === id && e.category === category);
                    if (eq) eligible.push(eq);
                }
            }
            for (let i = 0; i < Math.min(capacity, eligible.length); i++) {
                await supabase.from("equipment_event").insert({ equipment_id: eligible[i].id, event_id: event.id });
            }
        }
        console.log(`✅ Created ${lessons.length} lessons and ${events.length} events (1 per booking)`);

        console.log("✅ Master School seeded (students, teachers, commissions, packages, equipment, bookings, lessons/events)");
    } catch (err) {
        console.error("❌ Error seeding Master School:", err);
    }
};

seedMasterSchool();
