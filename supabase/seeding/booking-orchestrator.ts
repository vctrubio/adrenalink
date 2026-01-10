/**
 * Booking Package Lesson Teacher Orchestrator
 *
 * High-level utility to create complete bookings with all related entities:
 * - Booking with students (respecting package capacity)
 * - Student packages (marked as purchased)
 * - Lesson with assigned teacher and commission
 * - Events with full duration
 * - Equipment assignments via teacher_equipment
 * - Student and teacher payments
 *
 * Usage: orchestrateBookingFlow({
 *   schoolId: "...",
 *   packageId: "...",
 *   teacherId: "...",
 *   commissionId: "...",
 *   studentIds: ["...", "..."],
 *   equipment: [...],
 *   dayOffset: 0
 * })
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export interface BookingFlowInput {
    schoolId: string;
    packageId: string;
    teacherId: string;
    commissionId: string;
    studentIds: string[];
    equipment: any[];
    dayOffset?: number; // Default: today (0)
}

export interface BookingFlowResult {
    booking: any;
    lesson: any;
    events: any[];
    studentPackage: any;
}

/**
 * Create a complete booking flow: booking -> lesson -> events -> payments -> equipment
 *
 * @param input - Booking configuration
 * @returns Created booking, lesson, events, and student package
 */
export const orchestrateBookingFlow = async (input: BookingFlowInput): Promise<BookingFlowResult> => {
    const { schoolId, packageId, teacherId, commissionId, studentIds, equipment, dayOffset = 0 } = input;

    // 1. Get school package details
    const { data: schoolPkg, error: pkgError } = await supabase.from("school_package").select("*").eq("id", packageId).single();
    if (pkgError) throw pkgError;

    // 2. Validate student count matches package capacity
    if (studentIds.length !== schoolPkg.capacity_students) {
        throw new Error(`Student count (${studentIds.length}) must match package capacity (${schoolPkg.capacity_students})`);
    }

    // 3. Create or get student package
    const { data: studentPkg, error: spError } = await supabase
        .from("student_package")
        .select("*")
        .eq("school_package_id", packageId)
        .single();
    if (spError && spError.code !== "PGRST116") throw spError; // Ignore "no rows" error

    let studentPackage = studentPkg;
    if (!studentPackage) {
        // Create new student package if doesn't exist
        const { data: newSp, error: createSpError } = await supabase
            .from("student_package")
            .insert({
                school_package_id: packageId,
                wallet_id: faker.string.uuid(),
                requested_date_start: new Date().toISOString().split("T")[0],
                requested_date_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                status: "purchased",
            })
            .select()
            .single();
        if (createSpError) throw createSpError;
        studentPackage = newSp;
    } else {
        // Update existing to purchased
        const { error: updateError } = await supabase
            .from("student_package")
            .update({ status: "purchased" })
            .eq("id", studentPackage.id);
        if (updateError) throw updateError;
    }

    // 4. Create booking
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + dayOffset);
    const bookingDateStr = bookingDate.toISOString().split("T")[0];

    const { data: booking, error: bookingError } = await supabase
        .from("booking")
        .insert({
            school_id: schoolId,
            school_package_id: packageId,
            date_start: bookingDateStr,
            date_end: bookingDateStr,
            leader_student_name: `${faker.person.firstName()} ${faker.person.lastName()}`,
            status: "completed",
        })
        .select()
        .single();
    if (bookingError) throw bookingError;

    // 5. Link students to booking
    const bookingStudentRecords = studentIds.map((studentId) => ({
        booking_id: booking.id,
        student_id: studentId,
    }));

    const { error: linkError } = await supabase.from("booking_student").insert(bookingStudentRecords);
    if (linkError) throw linkError;

    // 6. Create lesson with teacher and commission
    const { data: lesson, error: lessonError } = await supabase
        .from("lesson")
        .insert({
            school_id: schoolId,
            teacher_id: teacherId,
            booking_id: booking.id,
            commission_id: commissionId,
            status: "completed",
        })
        .select()
        .single();
    if (lessonError) throw lessonError;

    // 7. Create event(s) from booking date + package duration
    const eventDate = new Date(bookingDateStr + "T09:00:00Z");
    const duration = schoolPkg.duration_minutes || 60;

    const { data: events, error: eventError } = await supabase
        .from("event")
        .insert({
            school_id: schoolId,
            lesson_id: lesson.id,
            date: eventDate.toISOString(),
            duration: duration,
            location: faker.location.city(),
            status: "completed",
        })
        .select();
    if (eventError) throw eventError;

    // 8. Add equipment to events (from teacher's assigned equipment)
    if (equipment.length > 0 && events.length > 0) {
        const equipmentEventRecords = events.flatMap((event) =>
            equipment.slice(0, 2).map((eq) => ({
                equipment_id: eq.id,
                event_id: event.id,
            })),
        );

        const { error: eqError } = await supabase.from("equipment_event").insert(equipmentEventRecords);
        if (eqError) throw eqError;
    }

    // 9. Create student booking payments
    const { data: commission } = await supabase.from("teacher_commission").select("*").eq("id", commissionId).single();

    const studentPaymentAmount = schoolPkg.price_per_student || 100;
    const studentPaymentRecords = studentIds.map((studentId) => ({
        booking_id: booking.id,
        student_id: studentId,
        amount: studentPaymentAmount,
    }));

    const { error: spayError } = await supabase.from("student_booking_payment").insert(studentPaymentRecords);
    if (spayError) throw spayError;

    // 10. Create teacher lesson payment
    let teacherPaymentAmount: number;
    if (commission.commission_type === "percentage") {
        const percentage = parseFloat(commission.cph);
        teacherPaymentAmount = Math.round((studentPaymentAmount * percentage) / 100);
    } else {
        teacherPaymentAmount = Math.round(parseFloat(commission.cph) * 100);
    }

    const { error: tpayError } = await supabase.from("teacher_lesson_payment").insert({
        lesson_id: lesson.id,
        amount: teacherPaymentAmount,
    });
    if (tpayError) throw tpayError;

    // 11. Create student feedback
    const feedbackRecords = studentIds.map((studentId) => ({
        student_id: studentId,
        lesson_id: lesson.id,
        feedback: faker.lorem.sentence(),
    }));

    const { error: feedbackError } = await supabase.from("student_lesson_feedback").insert(feedbackRecords);
    if (feedbackError) throw feedbackError;

    console.log(
        `✅ Orchestrated complete booking flow: ${booking.id} (${studentIds.length} students, 1 teacher, ${events.length} event(s))`,
    );

    return {
        booking,
        lesson,
        events: events || [],
        studentPackage,
    };
};
