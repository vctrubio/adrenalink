/**
 * Payment Seeding (Fresh)
 *
 * Create teacher lesson payments
 * Create student booking payments with realistic amounts
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

/**
 * Create teacher lesson payments based on commission
 * Commission has: commission_type (percentage|fixed) and cph (value)
 * For percentage: calculate from booking price_per_student
 * For fixed: use cph as fixed amount
 */
export const createTeacherLessonPayments = async (
    lessons: any[],
    teacherCommissions: Map<string, any>, // lesson.commission_id -> commission object
    schoolPackages: Map<string, any>, // booking.school_package_id -> package object
): Promise<void> => {
    const payments: any[] = [];

    for (const lesson of lessons) {
        const commission = teacherCommissions.get(lesson.commission_id);
        const schoolPkg = schoolPackages.get(lesson.booking_id); // Will need to look up via booking

        if (!commission) continue;

        let amount: number;
        if (commission.commission_type === "percentage") {
            // Percentage of price per student
            const baseAmount = schoolPkg?.price_per_student || 100;
            const percentage = parseFloat(commission.cph);
            amount = Math.round((baseAmount * percentage) / 100);
        } else {
            // Fixed amount from cph
            amount = Math.round(parseFloat(commission.cph) * 100); // Convert to cents if needed
        }

        payments.push({
            lesson_id: lesson.id,
            amount: amount,
        });
    }

    if (payments.length === 0) return;

    const { error } = await supabase.from("teacher_lesson_payment").insert(payments);
    if (error) throw error;
    console.log(`✅ Created ${payments.length} teacher lesson payments`);
};

/**
 * Create student booking payments
 * Amount = price_per_student from school_package
 */
export const createStudentBookingPayments = async (
    bookings: any[],
    bookingStudents: Map<string, string[]>,
    schoolPackages: Map<string, any>, // school_package_id -> package object
): Promise<void> => {
    const payments: any[] = [];

    for (const booking of bookings) {
        const studentIds = bookingStudents.get(booking.id) || [];
        const schoolPkg = schoolPackages.get(booking.school_package_id);
        const amount = schoolPkg?.price_per_student || 100;

        for (const studentId of studentIds) {
            payments.push({
                booking_id: booking.id,
                student_id: studentId,
                amount: amount,
            });
        }
    }

    if (payments.length === 0) return;

    const { error } = await supabase.from("student_booking_payment").insert(payments);
    if (error) throw error;
    console.log(`✅ Created ${payments.length} student booking payments`);
};
