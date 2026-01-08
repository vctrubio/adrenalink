"use server";

import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { ApiActionResponseModel } from "@/types/actions";

export interface StudentPackageBookingLessons {
  id: string;
  firstName: string;
  lastName: string;
  lessons: Array<{
    id: string;
    teacherUsername: string;
    teacherName: string;
    status: string;
    commission: { type: string; cph: number };
    events: Array<{ id: string; date: string; duration: number; location: string; status: string }>;
    booking: { id: string; dateStart: string; dateEnd: string; schoolId: string };
    schoolPackage: {
      id: string;
      name: string;
      capacityStudents: number;
      pricePerStudent: number;
      durationMinutes: number;
      categoryEquipment: string;
      capacityEquipment: number;
    };
  }>;
}

export interface TeacherPackageBookingLessons {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  lessons: Array<{
    id: string;
    status: string;
    commission: { type: string; cph: number };
    events: Array<{ id: string; date: string; duration: number; location: string; status: string }>;
    booking: { id: string; dateStart: string; dateEnd: string; schoolId: string };
    schoolPackage: {
      id: string;
      name: string;
      capacityStudents: number;
      pricePerStudent: number;
      durationMinutes: number;
      categoryEquipment: string;
      capacityEquipment: number;
    };
    studentNames: string[];
  }>;
}

/**
 * Get student with their bookings, lessons, events, and package information
 */
export async function getStudentPackageBookingLessons(
  studentId: string,
): Promise<ApiActionResponseModel<StudentPackageBookingLessons>> {
  try {
    const supabase = getServerConnection();

    // Fetch student with their booking_student associations
    const { data: student, error: studentError } = await supabase
      .from("student")
      .select(
        `
        id,
        first_name,
        last_name,
        booking_student!inner (
          booking:booking_id (
            id,
            date_start,
            date_end,
            school_id,
            school_package:school_package_id (
              id,
              description,
              capacity_students,
              price_per_student,
              duration_minutes,
              category_equipment,
              capacity_equipment
            ),
            lesson (
              id,
              status,
              teacher:teacher_id (
                username,
                first_name,
                last_name
              ),
              commission:commission_id (
                commission_type,
                cph
              ),
              event (
                id,
                date,
                duration,
                location,
                status
              )
            )
          )
        )
      `,
      )
      .eq("booking_student.student_id", studentId)
      .single();

    if (studentError) {
      console.error("Error fetching student:", studentError);
      return { success: false, error: "Failed to fetch student data" };
    }

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Transform the data into the expected format
    const lessons: StudentPackageBookingLessons["lessons"] = [];

    if (student.booking_student && Array.isArray(student.booking_student)) {
      student.booking_student.forEach((bs: any) => {
        const booking = bs.booking;
        if (booking && booking.lesson && Array.isArray(booking.lesson)) {
          booking.lesson.forEach((lesson: any) => {
            lessons.push({
              id: lesson.id,
              teacherUsername: lesson.teacher?.username || "",
              teacherName: `${lesson.teacher?.first_name || ""} ${lesson.teacher?.last_name || ""}`.trim(),
              status: lesson.status,
              commission: {
                type: lesson.commission?.commission_type || "",
                cph: parseInt(lesson.commission?.cph || "0"),
              },
              events: (lesson.event || []).map((event: any) => ({
                id: event.id,
                date: event.date,
                duration: event.duration,
                location: event.location,
                status: event.status,
              })),
              booking: {
                id: booking.id,
                dateStart: booking.date_start,
                dateEnd: booking.date_end,
                schoolId: booking.school_id,
              },
              schoolPackage: {
                id: booking.school_package?.id || "",
                name: booking.school_package?.description || "",
                capacityStudents: booking.school_package?.capacity_students || 0,
                pricePerStudent: booking.school_package?.price_per_student || 0,
                durationMinutes: booking.school_package?.duration_minutes || 0,
                categoryEquipment: booking.school_package?.category_equipment || "",
                capacityEquipment: booking.school_package?.capacity_equipment || 0,
              },
            });
          });
        }
      });
    }

    return {
      success: true,
      data: {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        lessons,
      },
    };
  } catch (error) {
    console.error("Error in getStudentPackageBookingLessons:", error);
    return { success: false, error: "Failed to fetch student package booking lessons" };
  }
}

/**
 * Get teacher with their lessons, events, commissions, and package information
 */
export async function getTeacherPackageBookingLessons(
  teacherId: string,
): Promise<ApiActionResponseModel<TeacherPackageBookingLessons>> {
  try {
    const supabase = getServerConnection();

    // Fetch teacher with their lessons
    const { data: teacher, error: teacherError } = await supabase
      .from("teacher")
      .select(
        `
        id,
        username,
        first_name,
        last_name,
        lesson (
          id,
          status,
          commission:commission_id (
            commission_type,
            cph
          ),
          booking:booking_id (
            id,
            date_start,
            date_end,
            school_id,
            school_package:school_package_id (
              id,
              description,
              capacity_students,
              price_per_student,
              duration_minutes,
              category_equipment,
              capacity_equipment
            ),
            booking_student (
              student:student_id (
                first_name,
                last_name
              )
            )
          ),
          event (
            id,
            date,
            duration,
            location,
            status
          )
        )
      `,
      )
      .eq("id", teacherId)
      .single();

    if (teacherError) {
      console.error("Error fetching teacher:", teacherError);
      return { success: false, error: "Failed to fetch teacher data" };
    }

    if (!teacher) {
      return { success: false, error: "Teacher not found" };
    }

    // Transform the data into the expected format
    const lessons: TeacherPackageBookingLessons["lessons"] = [];

    if (teacher.lesson && Array.isArray(teacher.lesson)) {
      teacher.lesson.forEach((lesson: any) => {
        const booking = lesson.booking;
        const studentNames: string[] = [];

        if (booking && booking.booking_student && Array.isArray(booking.booking_student)) {
          booking.booking_student.forEach((bs: any) => {
            if (bs.student) {
              studentNames.push(
                `${bs.student.first_name || ""} ${bs.student.last_name || ""}`.trim(),
              );
            }
          });
        }

        lessons.push({
          id: lesson.id,
          status: lesson.status,
          commission: {
            type: lesson.commission?.commission_type || "",
            cph: parseInt(lesson.commission?.cph || "0"),
          },
          events: (lesson.event || []).map((event: any) => ({
            id: event.id,
            date: event.date,
            duration: event.duration,
            location: event.location,
            status: event.status,
          })),
          booking: {
            id: booking?.id || "",
            dateStart: booking?.date_start || "",
            dateEnd: booking?.date_end || "",
            schoolId: booking?.school_id || "",
          },
          schoolPackage: {
            id: booking?.school_package?.id || "",
            name: booking?.school_package?.description || "",
            capacityStudents: booking?.school_package?.capacity_students || 0,
            pricePerStudent: booking?.school_package?.price_per_student || 0,
            durationMinutes: booking?.school_package?.duration_minutes || 0,
            categoryEquipment: booking?.school_package?.category_equipment || "",
            capacityEquipment: booking?.school_package?.capacity_equipment || 0,
          },
          studentNames,
        });
      });
    }

    return {
      success: true,
      data: {
        id: teacher.id,
        username: teacher.username,
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        lessons,
      },
    };
  } catch (error) {
    console.error("Error in getTeacherPackageBookingLessons:", error);
    return { success: false, error: "Failed to fetch teacher package booking lessons" };
  }
}
