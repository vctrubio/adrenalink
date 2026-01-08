"use server";

import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { ApiActionResponseModel } from "@/types/actions";

export interface StudentPayload {
  first_name: string;
  last_name: string;
  passport: string;
  country: string;
  phone: string;
  languages: string[];
}

export interface TeacherPayload {
  first_name: string;
  last_name: string;
  username: string;
  passport: string;
  country: string;
  phone: string;
  languages: string[];
}

export interface CommissionPayload {
  commission_type: "fixed" | "percentage";
  cph: string;
  description?: string;
}

export interface PackagePayload {
  duration_minutes: number;
  description: string;
  price_per_student: number;
  capacity_students?: number;
  capacity_equipment?: number;
  category_equipment: string;
  package_type: string;
  is_public?: boolean;
  active?: boolean;
}

/**
 * Create student and link to school in a single transaction
 */
export async function createAndLinkStudent(
  studentData: StudentPayload,
  canRent = false,
  description?: string,
): Promise<
  ApiActionResponseModel<{
    student: any;
    schoolStudent: any;
  }>
> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    // Create student
    const { data: createdStudent, error: studentError } = await supabase
      .from("student")
      .insert(studentData)
      .select()
      .single();

    if (studentError || !createdStudent) {
      if (
        studentError?.code === "23505" ||
        studentError?.message?.includes("unique constraint")
      ) {
        return { success: false, error: "Student with this passport already exists" };
      }
      return { success: false, error: "Failed to create student" };
    }

    // Link to school
    const { data: createdSchoolStudent, error: linkError } = await supabase
      .from("school_students")
      .insert({
        school_id: schoolId,
        student_id: createdStudent.id,
        description: description || null,
        active: true,
        rental: canRent,
      })
      .select()
      .single();

    if (linkError || !createdSchoolStudent) {
      return { success: false, error: "Failed to link student to school" };
    }

    return {
      success: true,
      data: {
        student: createdStudent,
        schoolStudent: createdSchoolStudent,
      },
    };
  } catch (error) {
    console.error("Error creating and linking student:", error);
    return { success: false, error: "Failed to create and link student" };
  }
}

/**
 * Create and link teacher to school with commissions
 */
export async function createAndLinkTeacher(
  teacherData: Omit<TeacherPayload, "schoolId">,
  commissionsData: CommissionPayload[],
): Promise<
  ApiActionResponseModel<{
    teacher: any;
    commissions: any[];
  }>
> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    // Create teacher
    const { data: createdTeacher, error: teacherError } = await supabase
      .from("teacher")
      .insert({
        ...teacherData,
        school_id: schoolId,
      })
      .select()
      .single();

    if (teacherError || !createdTeacher) {
      if (
        teacherError?.code === "23505" ||
        teacherError?.message?.includes("unique constraint")
      ) {
        if (teacherError?.message?.includes("passport")) {
          return { success: false, error: "Teacher with this passport already exists" };
        } else if (teacherError?.message?.includes("username")) {
          return { success: false, error: "Teacher with this username already exists for this school" };
        }
      }
      return { success: false, error: "Failed to create teacher" };
    }

    // Create commissions
    const createdCommissions: any[] = [];
    for (const commissionData of commissionsData) {
      const { data: createdCommission, error: commissionError } = await supabase
        .from("teacher_commission")
        .insert({
          teacher_id: createdTeacher.id,
          commission_type: commissionData.commission_type,
          cph: commissionData.cph,
          description: commissionData.description || null,
        })
        .select()
        .single();

      if (commissionError || !createdCommission) {
        return { success: false, error: "Failed to create teacher commissions" };
      }

      createdCommissions.push(createdCommission);
    }

    return {
      success: true,
      data: {
        teacher: createdTeacher,
        commissions: createdCommissions,
      },
    };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return { success: false, error: "Failed to create teacher" };
  }
}

/**
 * Create school package
 */
export async function createSchoolPackage(
  packageData: PackagePayload,
): Promise<ApiActionResponseModel<any>> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    const { data: createdPackage, error } = await supabase
      .from("school_package")
      .insert({
        ...packageData,
        school_id: schoolId,
      })
      .select()
      .single();

    if (error || !createdPackage) {
      return { success: false, error: "Failed to create package" };
    }

    return { success: true, data: createdPackage };
  } catch (error) {
    console.error("Error creating package:", error);
    return { success: false, error: "Failed to create package" };
  }
}

/**
 * Create school equipment
 */
export async function createSchoolEquipment(equipmentData: {
  category: string;
  sku: string;
  model: string;
  color?: string;
  size?: number;
  status?: string;
}): Promise<ApiActionResponseModel<any>> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    const { data: createdEquipment, error } = await supabase
      .from("equipment")
      .insert({
        ...equipmentData,
        school_id: schoolId,
      })
      .select()
      .single();

    if (error || !createdEquipment) {
      return { success: false, error: "Failed to create equipment" };
    }

    return { success: true, data: createdEquipment };
  } catch (error) {
    console.error("Error creating equipment:", error);
    return { success: false, error: "Failed to create equipment" };
  }
}

/**
 * Master booking creation with students and optional lesson
 */
export async function masterBookingAdd(
  packageId: string,
  studentIds: string[],
  dateStart: string,
  dateEnd: string,
  teacherId?: string,
  commissionId?: string,
  referralId?: string,
  leaderStudentName?: string,
): Promise<
  ApiActionResponseModel<{
    booking: any;
    lesson?: any;
  }>
> {
  try {
    if (studentIds.length === 0) {
      return { success: false, error: "At least one student is required" };
    }

    if (teacherId && !commissionId) {
      return { success: false, error: "Commission ID is required when teacher is provided" };
    }

    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    // Create booking
    const { data: createdBooking, error: bookingError } = await supabase
      .from("booking")
      .insert({
        school_id: schoolId,
        school_package_id: packageId,
        date_start: new Date(dateStart),
        date_end: new Date(dateEnd),
        leader_student_name: leaderStudentName || "",
        status: "active",
      })
      .select()
      .single();

    if (bookingError || !createdBooking) {
      return { success: false, error: "Failed to create booking" };
    }

    // Link students to booking
    for (const studentId of studentIds) {
      const { error: linkError } = await supabase.from("booking_student").insert({
        booking_id: createdBooking.id,
        student_id: studentId,
      });

      if (linkError) {
        return { success: false, error: "Failed to link students to booking" };
      }
    }

    // Create lesson if teacher provided
    let createdLesson;
    if (teacherId && commissionId) {
      const { data: lesson, error: lessonError } = await supabase
        .from("lesson")
        .insert({
          school_id: schoolId,
          teacher_id: teacherId,
          booking_id: createdBooking.id,
          commission_id: commissionId,
          status: "active",
        })
        .select()
        .single();

      if (lessonError) {
        return { success: false, error: "Failed to create lesson" };
      }

      createdLesson = lesson;
    }

    return {
      success: true,
      data: {
        booking: createdBooking,
        lesson: createdLesson,
      },
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

/**
 * Data type for register tables
 */
export interface RegisterTables {
  students: Array<{
    id: string;
    studentId: string;
    description: string | null;
    active: boolean;
    rental: boolean;
    createdAt: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      passport: string;
      country: string;
      phone: string;
      languages: string[];
    };
  }>;
  teachers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    active: boolean;
    commissions: Array<{
      id: string;
      commissionType: string;
      cph: string;
      description: string | null;
    }>;
  }>;
  packages: Array<{
    id: string;
    durationMinutes: number;
    description: string;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    packageType: string;
    isPublic: boolean;
    active: boolean;
  }>;
  referrals: Array<{
    id: string;
    code: string;
    commissionType: string;
    commissionValue: string;
    description: string | null;
    active: boolean;
  }>;
  studentBookingStats: Record<string, {
    bookingCount: number;
    durationHours: number;
    allBookingsCompleted?: boolean;
  }>;
  teacherLessonStats: Record<string, {
    totalLessons: number;
    plannedLessons: number;
  }>;
}

/**
 * Fetch all register tables data for a school from headers
 */
export async function getRegisterTables(): Promise<ApiActionResponseModel<RegisterTables>> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    // Fetch students linked to school
    const { data: students, error: studentsError } = await supabase
      .from("school_students")
      .select(`
        student_id,
        description,
        active,
        rental,
        created_at,
        student:student_id (
          id,
          first_name,
          last_name,
          passport,
          country,
          phone,
          languages
        )
      `)
      .eq("school_id", schoolId);

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return { success: false, error: "Failed to fetch students" };
    }

    // Fetch teachers with commissions
    const { data: teachers, error: teachersError } = await supabase
      .from("teacher")
      .select(`
        *,
        teacher_commission (
          id,
          commission_type,
          cph,
          description
        )
      `)
      .eq("school_id", schoolId);

    if (teachersError) {
      console.error("Error fetching teachers:", teachersError);
      return { success: false, error: "Failed to fetch teachers" };
    }

    // Fetch packages
    const { data: packages, error: packagesError } = await supabase
      .from("school_package")
      .select("*")
      .eq("school_id", schoolId);

    if (packagesError) {
      console.error("Error fetching packages:", packagesError);
      return { success: false, error: "Failed to fetch packages" };
    }

    // Fetch referrals
    const { data: referrals, error: referralsError } = await supabase
      .from("referral")
      .select("*")
      .eq("school_id", schoolId);

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError);
      return { success: false, error: "Failed to fetch referrals" };
    }

    // Fetch student booking stats
    const { data: bookingStats, error: bookingStatsError } = await supabase
      .from("booking")
      .select(`
        booking_student (
          student_id
        ),
        school_package (
          duration_minutes
        )
      `)
      .eq("school_id", schoolId);

    if (bookingStatsError) {
      console.error("Error fetching booking stats:", bookingStatsError);
      return { success: false, error: "Failed to fetch booking stats" };
    }

    // Fetch teacher lesson stats
    const { data: lessonStats, error: lessonStatsError } = await supabase
      .from("lesson")
      .select("teacher_id, status")
      .eq("school_id", schoolId);

    if (lessonStatsError) {
      console.error("Error fetching lesson stats:", lessonStatsError);
      return { success: false, error: "Failed to fetch lesson stats" };
    }

    // Transform data to match RegisterTables interface
    const transformedStudents = (students || []).map((s: any) => ({
      id: s.student_id,
      studentId: s.student_id,
      description: s.description,
      active: s.active,
      rental: s.rental,
      createdAt: s.created_at,
      student: s.student ? {
        id: s.student.id,
        firstName: s.student.first_name,
        lastName: s.student.last_name,
        passport: s.student.passport,
        country: s.student.country,
        phone: s.student.phone,
        languages: s.student.languages,
      } : null,
    }));

    const transformedTeachers = (teachers || []).map((t: any) => ({
      id: t.id,
      firstName: t.first_name,
      lastName: t.last_name,
      username: t.username,
      passport: t.passport,
      country: t.country,
      phone: t.phone,
      languages: t.languages,
      active: t.active,
      commissions: (t.teacher_commission || []).map((c: any) => ({
        id: c.id,
        commissionType: c.commission_type,
        cph: c.cph,
        description: c.description,
      })),
    }));

    const transformedPackages = (packages || []).map((p: any) => ({
      id: p.id,
      durationMinutes: p.duration_minutes,
      description: p.description,
      pricePerStudent: p.price_per_student,
      capacityStudents: p.capacity_students,
      capacityEquipment: p.capacity_equipment,
      categoryEquipment: p.category_equipment,
      packageType: p.package_type,
      isPublic: p.is_public,
      active: p.active,
    }));

    const transformedReferrals = (referrals || []).map((r: any) => ({
      id: r.id,
      code: r.code,
      commissionType: r.commission_type,
      commissionValue: r.commission_value,
      description: r.description,
      active: r.active,
    }));

    // Compute student booking stats
    const studentBookingStats: Record<string, { bookingCount: number; durationHours: number; allBookingsCompleted?: boolean }> = {};
    if (bookingStats) {
      for (const booking of bookingStats) {
        const durationMinutes = booking.school_package?.duration_minutes || 0;
        const durationHours = durationMinutes / 60;

        if (booking.booking_student && Array.isArray(booking.booking_student)) {
          for (const bs of booking.booking_student) {
            const studentId = bs.student_id;
            if (!studentBookingStats[studentId]) {
              studentBookingStats[studentId] = { bookingCount: 0, durationHours: 0 };
            }
            studentBookingStats[studentId].bookingCount += 1;
            studentBookingStats[studentId].durationHours += durationHours;
          }
        }
      }
    }

    // Compute teacher lesson stats
    const teacherLessonStats: Record<string, { totalLessons: number; plannedLessons: number }> = {};
    if (lessonStats) {
      for (const lesson of lessonStats) {
        const teacherId = lesson.teacher_id;
        if (!teacherLessonStats[teacherId]) {
          teacherLessonStats[teacherId] = { totalLessons: 0, plannedLessons: 0 };
        }
        teacherLessonStats[teacherId].totalLessons += 1;
        if (lesson.status === "planned" || lesson.status === "active") {
          teacherLessonStats[teacherId].plannedLessons += 1;
        }
      }
    }

    return {
      success: true,
      data: {
        students: transformedStudents,
        teachers: transformedTeachers,
        packages: transformedPackages,
        referrals: transformedReferrals,
        studentBookingStats,
        teacherLessonStats,
      },
    };
  } catch (error) {
    console.error("Error in getRegisterTables:", error);
    return { success: false, error: "Failed to fetch register tables" };
  }
}
