/**
 * Payment Seeding
 * 
 * Create teacher lesson payments and student booking payments
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export const createTeacherLessonPayments = async (lessons: any[]): Promise<void> => {
    const payments = lessons.map((lesson) => ({
        lesson_id: lesson.id,
        amount: faker.number.int({ min: 30, max: 100 }),
    }));

    const { error } = await supabase.from("teacher_lesson_payment").insert(payments);
    if (error) throw error;
    console.log(`✅ Created ${payments.length} teacher lesson payments`);
};

export const createStudentBookingPayments = async (bookings: any[], bookingStudents: Map<string, string[]>): Promise<void> => {
    const payments = [];

    for (const booking of bookings) {
        const studentIds = bookingStudents.get(booking.id) || [];
        for (const studentId of studentIds) {
            payments.push({
                booking_id: booking.id,
                student_id: studentId,
                amount: faker.number.int({ min: 50, max: 200 }),
            });
        }
    }

    const { error } = await supabase.from("student_booking_payment").insert(payments);
    if (error) throw error;
    console.log(`✅ Created ${payments.length} student booking payments`);
};
