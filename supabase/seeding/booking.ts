/**
 * Booking Seeding
 * 
 * Create bookings and link students to bookings
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export const createBookings = async (schoolId: string, students: any[], studentPackages: any[], schoolPackages: any[]): Promise<{ bookings: any[]; studentMap: Map<string, string[]> }> => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const bookingRecords: any[] = [];
    const studentMappings: { bookingIndex: number; studentIds: string[] }[] = [];

    let studentIndex = 0;
    const studentBookingCount: Record<string, number> = {};

    for (const pkg of schoolPackages) {
        const matchedPackage = studentPackages.find((sp) => sp.school_package_id === pkg.id);
        if (!matchedPackage) continue;

        const assignedStudents: any[] = [];
        let nextStudentIndex = studentIndex;

        for (let i = 0; i < pkg.capacity_students; i++) {
            if (nextStudentIndex < students.length) {
                assignedStudents.push(students[nextStudentIndex]);
                studentBookingCount[students[nextStudentIndex].id] = (studentBookingCount[students[nextStudentIndex].id] || 0) + 1;
                nextStudentIndex++;
            } else {
                const recycleStudent = students.find((s) => (studentBookingCount[s.id] || 0) < 2);
                if (recycleStudent) {
                    assignedStudents.push(recycleStudent);
                    studentBookingCount[recycleStudent.id] = (studentBookingCount[recycleStudent.id] || 0) + 1;
                } else {
                    break;
                }
            }
        }

        if (assignedStudents.length === 0) break;

        studentIndex = nextStudentIndex;

        const booking = {
            school_id: schoolId,
            school_package_id: matchedPackage.id,
            date_start: startDate.toISOString().split("T")[0],
            date_end: endDate.toISOString().split("T")[0],
            leader_student_name: `${assignedStudents[0].first_name} ${assignedStudents[0].last_name}`,
            status: "completed",
        };

        bookingRecords.push(booking);
        studentMappings.push({
            bookingIndex: bookingRecords.length - 1,
            studentIds: assignedStudents.map((s) => s.id),
        });
    }

    const { data, error } = await supabase.from("booking").insert(bookingRecords).select();
    if (error) throw error;

    const bookingStudentMap = new Map<string, string[]>();
    for (let i = 0; i < data.length; i++) {
        const booking = data[i];
        const mapping = studentMappings[i];
        bookingStudentMap.set(booking.id, mapping.studentIds);
    }

    console.log(`✅ Created ${data.length} bookings (all COMPLETED)`);
    return { bookings: data, studentMap: bookingStudentMap };
};

export const linkStudentsToBookings = async (bookingData: { bookings: any[]; studentMap: Map<string, string[]> }): Promise<void> => {
    const relations = bookingData.bookings.flatMap((bk) => {
        const studentIds = bookingData.studentMap.get(bk.id) || [];
        return studentIds.map((studentId: string) => ({
            booking_id: bk.id,
            student_id: studentId,
        }));
    });

    const { error } = await supabase.from("booking_student").insert(relations);
    if (error) throw error;
    console.log(`✅ Linked ${relations.length} student-booking relations`);
};
