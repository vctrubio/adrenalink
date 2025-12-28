"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  booking,
  bookingStudent,
  studentPackageStudent,
  schoolStudents,
  lesson,
  event,
} from "@/drizzle/schema";
import {
  createStudentModel,
  createBookingModel,
  type StudentModel,
  type BookingModel,
  type StudentPackageModel,
} from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

// GET ALL STUDENTS
export async function getStudents(): Promise<
  ApiActionResponseModel<StudentModel[]>
> {
  try {
    const result = await db.query.student.findMany({
      with: {
        schoolStudents: true,
        bookingStudents: true,
        studentPackageStudents: true,
      },
    });

    const students: StudentModel[] = result.map((studentData) =>
      createStudentModel(studentData),
    );

    return { success: true, data: students };
  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      success: false,
      error: `Failed to fetch students: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET STUDENTS BY SCHOOL
export async function getStudentsBySchool(
  schoolId: string,
): Promise<ApiActionResponseModel<StudentModel[]>> {
  try {
    const result = await db.query.schoolStudents.findMany({
      where: eq(schoolStudents.schoolId, schoolId),
      with: {
        student: {
          with: {
            schoolStudents: true,
            bookingStudents: true,
            studentPackageStudents: true,
          },
        },
      },
    });

    const students: StudentModel[] = result.map((ss) =>
      createStudentModel(ss.student),
    );

    return { success: true, data: students };
  } catch (error) {
    console.error("Error fetching students by school:", error);
    return {
      success: false,
      error: `Failed to fetch students by school: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET STUDENT BOOKINGS (optionally filtered by school)
export async function getStudentBookings(
  studentId: string,
  schoolId?: string,
): Promise<ApiActionResponseModel<BookingModel[]>> {
  try {
    // Find all bookings where this student is linked via bookingStudent
    const bookingStudentLinks = await db.query.bookingStudent.findMany({
      where: eq(bookingStudent.studentId, studentId),
    });

    if (bookingStudentLinks.length === 0) {
      return { success: true, data: [] };
    }

    const bookingIds = bookingStudentLinks.map((link) => link.bookingId);

    // Fetch bookings with relations
    const bookingsResult = await db.query.booking.findMany({
      where: schoolId ? and(eq(booking.schoolId, schoolId)) : undefined,
      with: {
        lessons: {
          with: {
            teacher: true,
          },
        },
        bookingStudents: {
          with: {
            student: true,
          },
        },
        studentPackage: {
          with: {
            schoolPackage: true,
          },
        },
      },
    });

    // Filter to only bookings that have this student
    const studentBookings = bookingsResult.filter((b) =>
      bookingIds.includes(b.id),
    );

    const bookings: BookingModel[] = studentBookings.map((bookingData) =>
      createBookingModel(bookingData),
    );

    return { success: true, data: bookings };
  } catch (error) {
    console.error("Error fetching student bookings:", error);
    return {
      success: false,
      error: `Failed to fetch student bookings: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET STUDENT REQUESTS (studentPackages)
export async function getStudentRequests(
  studentId: string,
  schoolId?: string,
): Promise<ApiActionResponseModel<StudentPackageModel[]>> {
  try {
    // Find all studentPackages linked to this student via studentPackageStudent
    const packagesQuery = db.query.studentPackageStudent.findMany({
      where: eq(studentPackageStudent.studentId, studentId),
      with: {
        studentPackage: {
          with: {
            schoolPackage: true,
            studentPackageStudents: true,
            bookings: true,
            referral: true,
          },
        },
      },
    });

    const packagesResult = await packagesQuery;

    // Filter by schoolId if provided
    let filteredPackages = packagesResult.map((sps) => sps.studentPackage);

    if (schoolId) {
      filteredPackages = filteredPackages.filter(
        (pkg) => pkg.relations?.schoolPackage?.schoolId === schoolId,
      );
    }

    const packages: StudentPackageModel[] = filteredPackages.map(
      (packageData) => createStudentPackageModel(packageData),
    );

    return { success: true, data: packages };
  } catch (error) {
    console.error("Error fetching student requests:", error);
    return {
      success: false,
      error: `Failed to fetch student requests: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET STUDENT EVENTS
export async function getStudentEvents(
  studentId: string,
  schoolId?: string,
): Promise<ApiActionResponseModel<any[]>> {
  try {
    // Find all bookings where this student is linked
    const bookingStudentLinks = await db.query.bookingStudent.findMany({
      where: eq(bookingStudent.studentId, studentId),
    });

    if (bookingStudentLinks.length === 0) {
      return { success: true, data: [] };
    }

    const bookingIds = bookingStudentLinks.map((link) => link.bookingId);

    // Get all lessons from these bookings
    const lessonsResult = await db.query.lesson.findMany({
      where: schoolId ? and(eq(lesson.schoolId, schoolId)) : undefined,
      with: {
        booking: {
          with: {
            studentPackage: {
              with: {
                schoolPackage: true,
              },
            },
          },
        },
        teacher: true,
        events: true,
      },
    });

    // Filter lessons that belong to student's bookings
    const studentLessons = lessonsResult.filter((l) => bookingIds.includes(l.bookingId));

    // Extract all events from lessons
    const events = studentLessons.flatMap((lesson) =>
      lesson.events.map((evt) => ({
        ...evt,
        teacher: lesson.teacher,
        schoolPackage: lesson.booking?.studentPackage?.schoolPackage,
      })),
    );

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching student events:", error);
    return {
      success: false,
      error: `Failed to fetch student events: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
