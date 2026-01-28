"use server";

import { revalidatePath } from "next/cache";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import type { StudentWithBookingsAndPayments, StudentTableData, LessonWithPayments, BookingStudentPayments } from "@/config/tables";
import { calculateStudentStats } from "@/backend/data/StudentData";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function getStudentsTable(): Promise<StudentTableData[]> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return [];
        }

        const supabase = getServerConnection();

        // Fetch students associated with the school and their bookings
        const { data, error } = await supabase
            .from("school_students")
            .select(
                `
                active,
                description,
                student!inner(
                    id,
                    first_name,
                    last_name,
                    country,
                    phone,
                    languages,
                    created_at,
                    booking_student(
                        booking!inner(
                            id,
                            status,
                            date_start,
                            date_end,
                            school_package!inner(
                                description,
                                category_equipment,
                                capacity_equipment,
                                capacity_students,
                                duration_minutes,
                                price_per_student
                            ),
                            lesson(
                                id,
                                status,
                                teacher!inner(id, username),
                                teacher_commission!inner(cph, commission_type),
                                event(duration, status),
                                teacher_lesson_payment(amount)
                            ),
                            student_booking_payment(amount)
                        )
                    )
                )
            `,
            )
            .order("created_at", { ascending: false })
            .eq("school_id", schoolId);

        if (error) {
            logger.error("Error fetching students table", error);
            return [];
        }

        const result = safeArray(data).map((ss: any) => {
            const student = ss.student;

            const bookings = student.booking_student.map((bs: any) => {
                const b = bs.booking;
                const pkg = b.school_package;

                const lessons: LessonWithPayments[] = b.lesson.map((l: any) => {
                    const totalDuration = l.event.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                    const recordedPayments = l.teacher_lesson_payment
                        ? l.teacher_lesson_payment.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                        : 0;

                    return {
                        id: l.id,
                        teacherId: l.teacher.id,
                        teacherUsername: l.teacher.username,
                        status: l.status,
                        commission: {
                            type: l.teacher_commission.commission_type as "fixed" | "percentage",
                            cph: l.teacher_commission.cph,
                        },
                        events: {
                            totalCount: l.event.length,
                            totalDuration: totalDuration,
                            details: l.event.map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                        },
                        teacherPayments: recordedPayments,
                    };
                });

                const payments: BookingStudentPayments[] = b.student_booking_payment.map((p: any) => ({
                    student_id: 0,
                    amount: p.amount,
                }));

                const packageData = {
                    description: pkg.description,
                    categoryEquipment: pkg.category_equipment,
                    capacityEquipment: pkg.capacity_equipment,
                    capacityStudents: pkg.capacity_students,
                    durationMinutes: pkg.duration_minutes,
                    pricePerStudent: pkg.price_per_student,
                    pph: pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0,
                };

                // Calculate stats based on 1 student for the revenue column
                const bookingStats = calculateBookingStats({
                    package: { ...packageData, capacityStudents: 1 },
                    lessons,
                    payments,
                } as any);

                return {
                    id: b.id,
                    status: b.status,
                    dateStart: b.date_start,
                    dateEnd: b.date_end,
                    packageName: pkg.description,
                    packageDetails: packageData,
                    lessons,
                    stats: bookingStats,
                };
            });

            const studentResult: StudentWithBookingsAndPayments = {
                id: student.id,
                firstName: student.first_name,
                lastName: student.last_name,
                country: student.country,
                phone: student.phone,
                languages: student.languages,
                schoolStudentStatus: ss.active ? "active" : "inactive",
                schoolStudentDescription: ss.description,
                createdAt: student.created_at,
                bookings,
            };

            const stats = calculateStudentStats(studentResult);

            return {
                ...studentResult,
                stats,
            };
        });

        logger.debug("Fetched students table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching students table", error);
        return [];
    }
}

export async function updateStudent(studentId: string, updateData: {
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    description?: string | null;
    email?: string | null;
    active: boolean;
    rental: boolean;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School not found" };
        }

        const supabase = getServerConnection();

        // Update student table
        const { error: studentError } = await supabase
            .from("student")
            .update({
                first_name: updateData.first_name,
                last_name: updateData.last_name,
                passport: updateData.passport,
                country: updateData.country,
                phone: updateData.phone,
                languages: updateData.languages,
                updated_at: new Date().toISOString(),
            })
            .eq("id", studentId);

        if (studentError) {
            logger.error("Error updating student", studentError);
            return { success: false, error: "Failed to update student" };
        }

        // Update school_students table
        const { error: schoolStudentError } = await supabase
            .from("school_students")
            .update({
                description: updateData.description,
                email: updateData.email,
                active: updateData.active,
                rental: updateData.rental,
            })
            .eq("school_id", schoolId)
            .eq("student_id", studentId);

        if (schoolStudentError) {
            logger.error("Error updating school_students", schoolStudentError);
            return { success: false, error: "Failed to update student status" };
        }

        revalidatePath("/students");
        revalidatePath(`/students/${studentId}`);

        logger.info("Student updated successfully", { studentId, schoolId });
        return { success: true };
    } catch (error) {
        logger.error("Error updating student", error);
        return { success: false, error: "Failed to update student" };
    }
}

export async function deleteStudent(studentId: string): Promise<{ success: boolean; error?: string; canDelete?: boolean }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School not found" };
        }

        const supabase = getServerConnection();

        // Check if student has any bookings
        const { data: bookings, error: bookingCheckError } = await supabase
            .from("booking_student")
            .select("id")
            .eq("student_id", studentId)
            .limit(1);

        if (bookingCheckError) {
            logger.error("Error checking student bookings", bookingCheckError);
            return { success: false, error: "Failed to check student bookings" };
        }

        // If student has bookings, only allow soft delete (set active = false)
        if (bookings && bookings.length > 0) {
            const { error: softDeleteError } = await supabase
                .from("school_students")
                .update({ active: false })
                .eq("school_id", schoolId)
                .eq("student_id", studentId);

            if (softDeleteError) {
                logger.error("Error soft deleting student", softDeleteError);
                return { success: false, error: "Failed to deactivate student" };
            }

            revalidatePath("/students");
            revalidatePath(`/students/${studentId}`);

            logger.info("Student soft deleted (deactivated)", { studentId, schoolId });
            return { success: true, canDelete: false };
        }

        // If no bookings, perform hard delete
        const { error: deleteError } = await supabase
            .from("school_students")
            .delete()
            .eq("school_id", schoolId)
            .eq("student_id", studentId);

        if (deleteError) {
            logger.error("Error deleting student", deleteError);
            return { success: false, error: "Failed to delete student" };
        }

        revalidatePath("/students");

        logger.info("Student deleted successfully", { studentId, schoolId });
        return { success: true, canDelete: true };
    } catch (error) {
        logger.error("Error deleting student", error);
        return { success: false, error: "Failed to delete student" };
    }
}

