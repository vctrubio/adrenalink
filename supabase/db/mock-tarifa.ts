/**
 * Mock Tarifa School Seed
 *
 * Seeds only:
 * 1. School setup
 * 2. Teachers & Commissions
 * 3. Students
 * 4. Equipment
 * 5. School Packages
 *
 * Usage: bun supabase/db/mock-tarifa.ts
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    createDefaultEquipment,
    createDefaultSchoolPackages,
    supabase,
} from "../seeding/index";

const seedTarifaSchool = async () => {
    try {
        console.log("🌱 Starting Tarifa School Seed...\n");

        // Delete existing Tarifa school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "tarifa");
        if (existingSchools && existingSchools.length > 0) {
            // Extra forceful cleanup for bookings and packages
            await supabase.rpc("exec_sql", { sql: `DELETE FROM booking WHERE school_id = '${schoolId}';` });
            await supabase.rpc("exec_sql", { sql: `DELETE FROM school_package WHERE school_id = '${schoolId}';` });

            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Tarifa school...\n");
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
            // Ensure deletion is complete before proceeding
            let deleted = false;
            for (let i = 0; i < 5; i++) {
                const { data: check } = await supabase.from("school").select("id").eq("username", "tarifa");
                if (!check || check.length === 0) {
                    deleted = true;
                    break;
                }
                await new Promise(res => setTimeout(res, 500));
            }
            if (!deleted) throw new Error("Failed to fully delete existing Tarifa school before seeding");
                    if (!deleted) {
                        // Debug: print remaining related records
                        console.log("[DEBUG] School deletion failed. Checking related tables:");
                        const tables = [
                            "booking", "lesson", "event", "teacher", "equipment", "school_package", "school_subscription", "referral", "school_students", "student_package", "teacher_commission", "teacher_equipment", "equipment_repair", "student_booking_payment", "booking_student", "teacher_lesson_payment", "student_lesson_feedback", "equipment_event", "rental", "rental_equipment", "rental_student"
                        ];
                        for (const table of tables) {
                            try {
                                const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("school_id", schoolId);
                                console.log(`[DEBUG] Table ${table}: count=${count}`);
                            } catch (e) {
                                console.log(`[DEBUG] Table ${table}: error:`, e.message || e);
                            }
                        }
                        throw new Error("Failed to fully delete existing Tarifa school before seeding");
                    }
        }

        // 1. Create School
        console.log("1️⃣  Creating school...");
        const school = await createSchool({
            name: "Tarifa Kite School",
            username: "tarifa",
            country: "Spain",
            phone: "+34956000000",
            status: "beta",
            currency: "EUR",
            latitude: "36.0131",
            longitude: "-5.6078",
            timezone: "Europe/Madrid",
            website_url: "https://tarifakiteschool.com",
            instagram_url: "https://instagram.com/tarifakiteschool",
        });
        const schoolId = school.id;

        // 2. Create Teachers
        const teachers = await createTeachers(schoolId, 3);

        // 3. Create Teacher Commissions
        for (const teacher of teachers) {
            await createDefaultTeacherCommissions(teacher.id);
        }

        // 4. Create Students
        let students = await createStudents(10);
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

        // 5. Create Equipment
        const equipment = await createDefaultEquipment(schoolId);

        // 5. Create School Packages
        const packages = await createDefaultSchoolPackages(schoolId);
        // No bookings created for Tarifa
        console.log("✅ Created 0 bookings (none requested)");

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

        // 8. Add Equipment to Events (match category)
        const { data: events } = await supabase.from("event").select();
        const { data: lessons } = await supabase.from("lesson").select();
        if (events && lessons) {
            for (const event of events) {
                const lesson = lessons.find(l => l.id === event.lesson_id);
                if (!lesson) continue;
                const requiredCategory = lesson._categoryEquipment;
                // Find the school_package for this event
                const pkg = packages.find(p => p.id === event.school_package_id);
                const capacity = pkg ? pkg.capacity_equipment : 1;
                // Gather all eligible equipment (from all teachers) for this category
                const eligible = [];
                for (const eqIds of teacherEquipmentMap.values()) {
                    for (const id of eqIds) {
                        const eq = equipment.find(e => e.id === id && e.category === requiredCategory);
                        if (eq) eligible.push(eq);
                    }
                }
                // Assign up to capacity_equipment equipment to the event
                for (let i = 0; i < Math.min(capacity, eligible.length); i++) {
                    await supabase.from("equipment_event").insert({ equipment_id: eligible[i].id, event_id: event.id });
                }
            }
        }
        console.log("✅ Tarifa School seeded (students, teachers, commissions, packages, equipment, bookings, teacher-equipment, event-equipment)");
    } catch (err) {
        console.error("❌ Error seeding Tarifa School:", err);
    }
};

seedTarifaSchool().catch((err) => {
    console.log("[TOP-LEVEL ERROR]", err);
});
