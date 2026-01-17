/**
 * Mock Lisboa School Seed
 *
 * Seeds:
 * 1. School setup
 * 2. Teachers & Commissions
 * 3. Students
 * 4. Equipment
 * 5. School Packages (capacity 1, 2, 4)
 * 6. Bookings (12, 1 per student, various capacities, spread over days)
 * 7. Lessons & Events (spread, not all in one day)
 *
 * Usage: bun supabase/db/mock-lisboa.ts
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    createDefaultEquipment,
    createDefaultSchoolPackages,
    createBookings,
    linkStudentsToBookings,
    createLessonsAndEvents,
    supabase,
} from "../seeding/index";

const seedLisboaSchool = async () => {
    try {
        console.log("🌱 Starting Lisboa School Seed...\n");

        // Delete existing Lisboa school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "lisboa");
        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Lisboa school...\n");
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
            name: "Lisboa Kite School",
            username: "lisboa",
            country: "Portugal",
            phone: "+35121000000",
            status: "beta",
            currency: "EUR",
            latitude: "38.7223",
            longitude: "-9.1393",
            timezone: "Europe/Lisbon",
            website_url: "https://lisboakiteschool.com",
            instagram_url: "https://instagram.com/lisboakiteschool",
            email: "admin@lisboakiteschool.com",
            clerk_id: "user_lisboa_admin"
        });
        const schoolId = school.id;

        // 2. Create Teachers
        const teachers = await createTeachers(schoolId, 4);
        for (const teacher of teachers) {
            await createDefaultTeacherCommissions(teacher.id);
        }

        // 3. Create Students
        let students = await createStudents(16);
        if (!students || students.length === 0) throw new Error("No students created for Lisboa school");
        // Add 10 extra rsh students (no bookings)
        const rshStudents = await createStudents(10);
        students = students.concat(rshStudents);
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

        // 5. Create School Packages (capacity 1, 2, 4)
        let packages = await createDefaultSchoolPackages(schoolId);
        if (!Array.isArray(packages)) {
            packages = packages?.packages || packages?.data || [];
        }
        // Optionally, customize package capacities here if needed


        // 6. Create Bookings (1 per student per package, today to +3 days)
        const today = new Date();
        const bookings = [];
        let bookingCount = 0;
        for (let day = 0; day < 4; day++) {
            for (const pkg of packages) {
                for (const student of students) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + day);
                    const { data: bookingData, error: bookingError } = await supabase.from("booking").insert({
                        school_id: schoolId,
                        school_package_id: pkg.id,
                        date_start: date.toISOString().slice(0, 10),
                        date_end: date.toISOString().slice(0, 10),
                        leader_student_name: `${student.first_name} ${student.last_name}`,
                        status: "completed",
                    }).select();
                    if (bookingError || !bookingData || bookingData.length === 0) throw new Error("Failed to create booking");
                    const booking = bookingData[0];
                    bookings.push(booking);
                    await supabase.from("booking_student").insert({ booking_id: booking.id, student_id: student.id });
                    bookingCount++;
                }
            }
        }
        console.log(`✅ Created ${bookingCount} bookings from today to +3 days (all COMPLETED)`);

        // 7. Create Teacher-Equipment Relations (diverse, at least one per category)
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

        // 8. Create Lessons & Events
        // 8. Create Lessons, Events, and Equipment Assignments (guaranteed per booking)
        const lessons = [];
        const events = [];
        for (const booking of bookings) {
            // Pick a random teacher
            const teacher = teachers[Math.floor(Math.random() * teachers.length)];
            // Find a commission for this teacher
            const { data: commissions, error: commError } = await supabase.from("teacher_commission").select("id").eq("teacher_id", teacher.id);
            if (commError || !commissions || commissions.length === 0) throw new Error("No commission for teacher");
            const commission_id = commissions[0].id;
            // Find the package for this booking
            const pkg = packages.find(p => p.id === booking.school_package_id);
            const category = pkg ? pkg.category_equipment : "kite";
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
                location: "Lisbon Beach",
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
        console.log("✅ Lisboa School seeded (students, teachers, commissions, packages, equipment, bookings, lessons, events, equipment-events)");
    } catch (err) {
        console.error("❌ Error seeding Lisboa School:", err);
    }
};

seedLisboaSchool();
