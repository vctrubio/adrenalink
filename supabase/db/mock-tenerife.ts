/**
 * Mock Tenerife Kite School - Complete Seed
 *
 * Comprehensive seeding flow with realistic data:
 * 1. School setup with equipment_categories
 * 2. Teachers & Commissions (8 teachers with diverse commissions)
 * 3. Students & School Association (80 students)
 * 4. Equipment (48 items: 16 kites, 16 wings, 16 windsurfs)
 * 5. School Packages (8 packages with student capacity)
 * 6. Student Packages
 * 7. Bookings (6 months ago to today, lots of bookings)
 * 8. Teacher-Equipment relations
 * 9. Lessons & Events (1 per booking, events scheduled 9am-6pm in linked list fashion)
 * 10. Equipment to Events (via teacher_equipment, matching category)
 * 11. Student Feedback
 * 12. Teacher & Student Payments
 *
 * Usage: bun supabase/db/mock-tenerife.ts
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
import { faker } from "@faker-js/faker";

/**
 * Create lessons and events with proper 9am-6pm scheduling in linked list fashion
 * Events are scheduled sequentially from 9am, respecting duration and not going past 6pm
 */
const createLessonsAndEventsLinked = async (
    bookings: any[],
    teachers: any[],
    teacherCommissions: any[],
    schoolId: string,
    packages: any[],
    equipment: any[],
    studentPackageMap: Map<string, string>,
): Promise<{ lessons: any[]; events: any[] }> => {
    const lessonRecords: any[] = [];
    const eventRecords: any[] = [];

    // Group bookings by date_start
    const bookingsByDate: Record<string, any[]> = {};
    for (const bk of bookings) {
        if (!bookingsByDate[bk.date_start]) bookingsByDate[bk.date_start] = [];
        bookingsByDate[bk.date_start].push(bk);
    }

    // Process each day
    for (const dateStr of Object.keys(bookingsByDate)) {
        const dayBookings = bookingsByDate[dateStr];
        // Shuffle bookings for more realistic distribution
        dayBookings.sort(() => Math.random() - 0.5);

        // Start at 9am local time (Tenerife is UTC+0 in winter, UTC+1 in summer, but we'll use UTC+1)
        const dayStart = new Date(dateStr + "T09:00:00+01:00");
        const dayEnd = new Date(dateStr + "T18:00:00+01:00"); // 6pm
        let currentTime = new Date(dayStart);

        for (const bk of dayBookings) {
            // Pick a random teacher
            const teacher = teachers[Math.floor(Math.random() * teachers.length)];
            const teacherComms = teacherCommissions.filter((tc) => tc.teacher_id === teacher.id);
            if (teacherComms.length === 0) continue;

            // Pick a random commission for this teacher
            const commission = teacherComms[Math.floor(Math.random() * teacherComms.length)];
            const schoolPkg = packages.find((p) => p.id === bk.school_package_id);
            if (!schoolPkg) continue;

            const duration = schoolPkg.duration_minutes || 60;
            
            // Check if we can fit this event before 6pm
            const eventEnd = new Date(currentTime.getTime() + duration * 60000);
            if (eventEnd > dayEnd) {
                // Skip this booking if it doesn't fit in the day
                continue;
            }

            const lesson = {
                school_id: schoolId,
                teacher_id: teacher.id,
                booking_id: bk.id,
                commission_id: commission.id,
                status: "completed",
                _packageDuration: schoolPkg.duration_minutes,
                _capacityEquipment: schoolPkg.capacity_equipment,
                _categoryEquipment: schoolPkg.category_equipment,
            };

            lessonRecords.push(lesson);

            // Schedule event to start at currentTime
            const eventDate = new Date(currentTime);
            eventRecords.push({
                school_id: schoolId,
                lesson_id: "", // Will be filled after lessons created
                date: eventDate.toISOString(),
                duration: duration,
                location: faker.location.city() + " Beach",
                status: "completed",
                _lessonIndex: lessonRecords.length - 1,
                _capacityEquipment: schoolPkg.capacity_equipment,
                _categoryEquipment: schoolPkg.category_equipment,
                _bookingPackageId: bk.school_package_id, // Store for equipment assignment
            });

            // Move currentTime forward by duration + 15 minute gap (for setup/breakdown)
            currentTime = new Date(eventEnd.getTime() + 15 * 60000);
        }
    }

    // Insert lessons
    const lessonsToInsert = lessonRecords.map((l) => {
        const { _packageDuration, _capacityEquipment, _categoryEquipment, ...rest } = l;
        return rest;
    });

    const { data: lessons, error: lessonError } = await supabase.from("lesson").insert(lessonsToInsert).select();
    if (lessonError) throw lessonError;
    console.log(`✅ Created ${lessons.length} lessons (all COMPLETED)`);

    // Insert events
    const eventsToInsert = eventRecords.map((evt) => {
        const { _lessonIndex, _capacityEquipment, _categoryEquipment, _bookingPackageId, ...rest } = evt;
        return {
            ...rest,
            lesson_id: lessons[_lessonIndex]?.id || lessons[0].id,
        };
    });

    const { data: events, error: eventError } = await supabase.from("event").insert(eventsToInsert).select();
    if (eventError) throw eventError;
    console.log(`✅ Created ${events.length} events (all COMPLETED, scheduled 9am-6pm)`);

    return { lessons, events };
};

const seedTenerifeKiteSchool = async () => {
    try {
        console.log("🌱 Starting Tenerife Kite School Seed...\n");

        // Delete existing Tenerife school completely
        const { data: existingSchools } = await supabase.from("school").select("id").eq("username", "tenerife");

        if (existingSchools && existingSchools.length > 0) {
            const schoolId = existingSchools[0].id;
            console.log("🗑️  Cleaning up existing Tenerife school...\n");

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
            name: "Tenerife Kite Academy",
            username: "tenerife",
            country: "Spain",
            phone: "+34 922 123 456",
            status: "beta",
            currency: "EUR",
            latitude: "28.4636",
            longitude: "-16.2518",
            timezone: "Atlantic/Canary",
            website_url: "https://tenerifekiteacademy.com",
            instagram_url: "https://instagram.com/tenerifekiteacademy",
            email: "admin@tenerifekiteacademy.com",
            clerk_id: process.env.VCTRUBIO_CLERK_ID_TESTER || "user_38iCzHCmEjbDcCKyfea25PhakbM"
        });
        const schoolId = school.id;

        // Update school with equipment_categories
        await supabase.from("school").update({ equipment_categories: "kite,wing,windsurf" }).eq("id", schoolId);
        console.log("✅ Updated with equipment_categories: kite,wing,windsurf");

        // 2. Create Teachers & Commissions (8 teachers for more diversity)
        console.log("2️⃣  Creating teachers and commissions...");
        const teachers = await createTeachers(schoolId, 8);
        const allCommissions: any[] = [];
        const commissionMap = new Map<string, any>();
        for (const teacher of teachers) {
            const comms = await createDefaultTeacherCommissions(teacher.id);
            allCommissions.push(...comms);
            comms.forEach((c) => commissionMap.set(c.id, c));
        }

        // 3. Create Students & Associate (80 students for lots of bookings)
        console.log("3️⃣  Creating students...");
        const students = await createStudents(80);
        await associateStudentsWithSchool(schoolId, students);

        // 4. Create Equipment & Packages
        console.log("4️⃣  Creating equipment and school packages...");
        const equipment = await createDefaultEquipment(schoolId);
        const packages = await createDefaultSchoolPackages(schoolId);
        const packageMap = new Map<string, any>();
        packages.forEach((p) => packageMap.set(p.id, p));

        // 5. Create Bookings (6 months ago to today, lots of bookings)
        console.log("5️⃣  Creating bookings (6 months ago to today)...");
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        
        const bookings = [];
        const bookingStudents = new Map();
        let bookingCount = 0;
        
        // Create bookings spread over 6 months
        // Each student gets 1-3 bookings (more realistic)
        const totalDays = Math.floor((today.getTime() - sixMonthsAgo.getTime()) / (1000 * 60 * 60 * 24));
        
        for (const student of students) {
            // Each student gets 1-3 bookings
            const numBookings = Math.floor(Math.random() * 3) + 1;
            
            for (let b = 0; b < numBookings; b++) {
                // Random day over the 6 months
                const randomDayOffset = Math.floor(Math.random() * totalDays);
                const bookingDate = new Date(sixMonthsAgo);
                bookingDate.setDate(sixMonthsAgo.getDate() + randomDayOffset);
                
                // Pick a random package (can be group capacity)
                const pkg = packages[Math.floor(Math.random() * packages.length)];
                
                // Determine if this is a group booking (30% chance for group packages)
                const isGroup = pkg.capacity_students > 1 && Math.random() < 0.3;
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
        }
        console.log(`✅ Created ${bookingCount} bookings from 6 months ago to today (all COMPLETED)`);

        // 6. Create Teacher-Equipment Relations (diverse, at least one per category per teacher)
        console.log("6️⃣  Creating teacher-equipment relations...");
        const categories = [...new Set(equipment.map(e => e.category))];
        const usedEquipment = new Set();
        const teacherEquipmentMap = new Map();
        for (const teacher of teachers) {
            const teacherEquip = [];
            // Each teacher gets equipment from each category
            for (const category of categories) {
                // Find 2-3 unused equipment items of this category per teacher
                const available = equipment.filter(e => e.category === category && !usedEquipment.has(e.id));
                const count = Math.min(Math.floor(Math.random() * 2) + 2, available.length);
                for (let i = 0; i < count; i++) {
                    const eq = available[i];
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
            }
            teacherEquipmentMap.set(teacher.id, teacherEquip);
        }
        console.log("✅ Created diverse teacher-equipment relations");

        // 7. Create Lessons & Events (with 9am-6pm linked list scheduling)
        console.log("7️⃣  Creating lessons and events (9am-6pm linked list)...");
        const { lessons, events } = await createLessonsAndEventsLinked(
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
        await createStudentLessonFeedback(bookings, lessons, bookingStudents);

        // 10. Create Teacher Payments
        console.log("1️⃣1️⃣  Creating teacher lesson payments...");
        await createTeacherLessonPayments(lessons, commissionMap, packageMap);

        // 11. Create Student Payments
        console.log("1️⃣2️⃣  Creating student booking payments...");
        await createStudentBookingPayments(bookings, bookingStudents, packageMap);

        console.log("\n✨ Tenerife Kite Academy seed completed successfully!");
        console.log(`   School ID: ${schoolId}`);
        console.log("   Username: tenerife");
        console.log(`   Teachers: ${teachers.length}`);
        console.log(`   Students: ${students.length}`);
        console.log(`   Packages: ${packages.length}`);
        console.log(`   Bookings: ${bookings.length} (6 months ago to today)`);
        console.log(`   Lessons: ${lessons.length} (1 per booking)`);
        console.log(`   Events: ${events.length} (scheduled 9am-6pm)`);
        console.log(`   Equipment: ${equipment.length}`);
        console.log("   All payments and relationships created! ✅\n");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedTenerifeKiteSchool().then(() => {
    console.log("✨ Done! Exiting...");
    process.exit(0);
});
