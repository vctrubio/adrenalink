/**
 * Mock 5 Schools Seed
 *
 * Creates 5 distinct schools with:
 * - Unique credentials (clerk_id, email)
 * - 2 Teachers per school
 * - 5 Students per school
 * - Equipment (KITE & WING only)
 * - Packages (KITE & WING only)
 * - NO Bookings
 *
 * Usage: bun supabase/db/mock-5.ts
 */

import {
    createSchool,
    createTeachers,
    createDefaultTeacherCommissions,
    createStudents,
    createDefaultEquipment,
    createDefaultSchoolPackages,
    associateStudentsWithSchool,
    supabase,
} from "../seeding/index";

const LOCATIONS = [
    { name: "Alpha Kite Center", username: "alpha_kite", country: "Greece", city: "Tarifa", lat: 36.01, lng: -5.60 },
    { name: "Bravo Wing School", username: "bravo_wing", country: "Italy", city: "Sicily", lat: 37.86, lng: 12.43 },
    { name: "Charlie Surf Spot", username: "charlie_surf", country: "Portugal", city: "Cascais", lat: 38.69, lng: -9.42 },
    { name: "Delta Watersports", username: "delta_water", country: "France", city: "Leucate", lat: 42.90, lng: 3.05 },
    { name: "Echo Foil Academy", username: "echo_foil", country: "Germany", city: "Sylt", lat: 54.90, lng: 8.30 },
];

const seedFiveSchools = async () => {
    try {
        console.log("🌱 Starting 5 Schools Seed (Kite & Wing Only)...");

        for (const loc of LOCATIONS) {
            console.log(`
🏫 Processing ${loc.name} (${loc.username})...`);

            // 1. Cleanup Existing
            const { data: existing } = await supabase.from("school").select("id").eq("username", loc.username);
            if (existing && existing.length > 0) {
                const schoolId = existing[0].id;
                console.log(`   🗑️  Cleaning up existing school...`);
                // Cascade delete handles everything
                await supabase.from("school").delete().eq("id", schoolId);
            }

            // 2. Create School
            const school = await createSchool({
                name: loc.name,
                username: loc.username,
                country: loc.country,
                phone: `+100000000${LOCATIONS.indexOf(loc)}`, // Dummy phone
                status: "beta",
                currency: "EUR",
                latitude: loc.lat.toString(),
                longitude: loc.lng.toString(),
                timezone: "Europe/Madrid", // Simplified timezone
                website_url: `https://${loc.username}.com`,
                instagram_url: `https://instagram.com/${loc.username}`,
                email: `admin@${loc.username}.com`,
                clerk_id: `user_${loc.username}_admin`
            });
            const schoolId = school.id;

            // Update categories (Kite & Wing only)
            await supabase.from("school").update({ equipment_categories: "kite,wing" }).eq("id", schoolId);

            // 3. Create Teachers (2 per school)
            const teachers = await createTeachers(schoolId, 2);
            for (const teacher of teachers) {
                await createDefaultTeacherCommissions(teacher.id);
            }

            // 4. Create Students (5 per school)
            const students = await createStudents(5);
            await associateStudentsWithSchool(schoolId, students);

            // 5. Create Equipment (Kite & Wing only)
            // We create default equipment first, then delete non-kite/wing items
            const allEquipment = await createDefaultEquipment(schoolId);
            const unwantedEquipmentIds = allEquipment
                .filter(e => e.category !== "kite" && e.category !== "wing")
                .map(e => e.id);
            
            if (unwantedEquipmentIds.length > 0) {
                await supabase.from("equipment").delete().in("id", unwantedEquipmentIds);
                console.log(`   ✂️  Removed ${unwantedEquipmentIds.length} non-kite/wing equipment items`);
            }

            // 6. Create Packages (Kite & Wing only)
            const allPackages = await createDefaultSchoolPackages(schoolId);
            const unwantedPackageIds = allPackages
                .filter(p => p.category_equipment !== "kite" && p.category_equipment !== "wing")
                .map(p => p.id);

            if (unwantedPackageIds.length > 0) {
                await supabase.from("school_package").delete().in("id", unwantedPackageIds);
                console.log(`   ✂️  Removed ${unwantedPackageIds.length} non-kite/wing packages`);
            }

            console.log(`   ✅ ${loc.name} seeded successfully!`);
        }

        console.log("\n✨ All 5 schools seeded successfully!");

    } catch (err) {
        console.error("❌ Error seeding schools:", err);
        process.exit(1);
    }
};

seedFiveSchools().then(() => {
    process.exit(0);
});
