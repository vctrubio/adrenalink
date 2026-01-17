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

        // Delete existing Tarifa school completely (Cascades to all data except subscriptions)
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "tarifa");
        
        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log(`🗑️  Cleaning up existing Tarifa school (${schoolId})...\n`);
            
            // This will cascade to all related tables because of ON DELETE CASCADE
            const { error: deleteError } = await supabase.from("school").delete().eq("id", schoolId);
            
            if (deleteError) {
                console.error("❌ Failed to delete school:", deleteError);
                throw deleteError;
            }
            
            console.log("✅ Cleaned up existing data via cascade\n");
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
            email: "admin@tarifakiteschool.com",
            clerk_id: "user_tarifa_admin"
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
