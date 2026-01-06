/**
 * Booking Seeding (Fresh) 
 * 
 * Create bookings with dates from today to +3 days
 * Link students and student packages properly
 * Set student package status to purchased
 */

import { supabase } from "./client";
import { faker } from "@faker-js/faker";

export const createBookings = async (
    schoolId: string,
    students: any[],
    studentPackages: any[],
    schoolPackages: any[]
): Promise<{ bookings: any[]; studentMap: Map<string, string[]>; studentPackageMap: Map<string, string> }> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingRecords: any[] = [];
    const studentMappings: { bookingIndex: number; studentIds: string[] }[] = [];
    const studentPackageMap = new Map<string, string>();

    let studentIndex = 0;
    const studentBookingCount: Record<string, number> = {};

    // Create bookings from today to +3 days
    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
        let nextStudentIndex = studentIndex;
        for (const pkg of schoolPackages) {
            const assignedStudents: any[] = [];

            // Assign exactly pkg.capacity_students students (enforce constraint)
            for (let i = 0; i < pkg.capacity_students; i++) {
                if (nextStudentIndex < students.length) {
                    assignedStudents.push(students[nextStudentIndex]);
                    studentBookingCount[students[nextStudentIndex].id] =
                        (studentBookingCount[students[nextStudentIndex].id] || 0) + 1;
                    nextStudentIndex++;
                } else {
                    // Wrap around: find least-booked student
                    const leastBookedStudent = students.reduce((min, curr) =>
                        (studentBookingCount[curr.id] || 0) < (studentBookingCount[min.id] || 0)
                            ? curr
                            : min
                    );
                    assignedStudents.push(leastBookedStudent);
                    studentBookingCount[leastBookedStudent.id] =
                        (studentBookingCount[leastBookedStudent.id] || 0) + 1;
                    nextStudentIndex = (nextStudentIndex + 1) % students.length;
                }
            }

            // Enforce: assignedStudents.length must equal pkg.capacity_students
            if (assignedStudents.length !== pkg.capacity_students) continue;

            // Find student package for this booking
            const studentPkg = studentPackages.find((sp) => sp.school_package_id === pkg.id);
            if (!studentPkg) continue;

            // Calculate dates from today + dayOffset
            const bookingDate = new Date(today);
            bookingDate.setDate(bookingDate.getDate() + dayOffset);
            const bookingDateStr = bookingDate.toISOString().split("T")[0];

            const booking = {
                school_id: schoolId,
                school_package_id: pkg.id,
                date_start: bookingDateStr,
                date_end: bookingDateStr,
                leader_student_name: `${assignedStudents[0].first_name} ${assignedStudents[0].last_name}`,
                status: "completed",
                _studentPackageId: studentPkg.id,
            };

            bookingRecords.push(booking);
            studentMappings.push({
                bookingIndex: bookingRecords.length - 1,
                studentIds: assignedStudents.map((s) => s.id),
            });
        }
        studentIndex = nextStudentIndex;
    }

    // Insert bookings
    const { data, error } = await supabase
        .from("booking")
        .insert(
            bookingRecords.map((b) => {
                const { _studentPackageId, ...rest } = b;
                return rest;
            })
        )
        .select();
    if (error) throw error;

    // Build mappings
    const bookingStudentMap = new Map<string, string[]>();
    for (let i = 0; i < data.length; i++) {
        const booking = data[i];
        const mapping = studentMappings[i];
        bookingStudentMap.set(booking.id, mapping.studentIds);
        studentPackageMap.set(booking.id, bookingRecords[i]._studentPackageId);
    }

    console.log(
        `✅ Created ${data.length} bookings from today to +3 days (all COMPLETED)`
    );
    return { bookings: data, studentMap: bookingStudentMap, studentPackageMap };
};

export const linkStudentsToBookings = async (bookingData: {
    bookings: any[];
    studentMap: Map<string, string[]>;
}): Promise<void> => {
    const relationsSet = new Set<string>(); // Track unique (booking_id, student_id) pairs
    const relations = [];

    for (const bk of bookingData.bookings) {
        const studentIds = bookingData.studentMap.get(bk.id) || [];
        for (const studentId of studentIds) {
            const key = `${bk.id}:${studentId}`;
            if (!relationsSet.has(key)) {
                relationsSet.add(key);
                relations.push({
                    booking_id: bk.id,
                    student_id: studentId,
                });
            }
        }
    }

    if (relations.length === 0) {
        console.log("ℹ️  No student-booking relations to create");
        return;
    }

    const { error } = await supabase.from("booking_student").insert(relations);
    if (error) throw error;
    console.log(`✅ Linked ${relations.length} student-booking relations`);
};

/**
 * Update student package status to purchased for all bookings
 */
export const updateStudentPackageStatus = async (studentPackageMap: Map<string, string>): Promise<void> => {
    const studentPackageIds = Array.from(new Set(studentPackageMap.values()));
    if (studentPackageIds.length === 0) return;

    const { error } = await supabase
        .from("student_package")
        .update({ status: "purchased" })
        .in("id", studentPackageIds);

    if (error) throw error;
    console.log(`✅ Updated ${studentPackageIds.length} student packages to purchased`);
};
