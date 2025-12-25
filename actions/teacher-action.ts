"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  teacher,
  lesson,
  teacherEquipment,
  teacherCommission,
  type LessonType,
  type EventType,
  type TeacherCommissionType,
} from "@/drizzle/schema";
import {
  createTeacherModel,
  type TeacherModel,
} from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";
import { getSchoolHeader } from "@/types/headers";

// GET ALL TEACHERS (filtered by school from header)
export async function getTeachers(): Promise<
  ApiActionResponseModel<TeacherModel[]>
> {
  try {
    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
      return {
        success: false,
        error: "School not found from subdomain header",
      };
    }

    const schoolId = schoolHeader.id;

    const result = await db.query.teacher.findMany({
      where: eq(teacher.schoolId, schoolId),
      with: {
        commissions: true,
        lessons: {
          with: {
            events: true,
            booking: {
              with: {
                studentPackage: {
                  with: {
                    schoolPackage: true,
                  },
                },
              },
            },
          },
        },
        equipments: {
          with: {
            equipment: true,
          },
        },
      },
    });

    const teachers: TeacherModel[] = result.map((teacherData) =>
      createTeacherModel(teacherData),
    );

    return { success: true, data: teachers };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return {
      success: false,
      error: `Failed to fetch teachers: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET TEACHER LESSONS WITH EVENTS AND EQUIPMENT
export async function getTeacherLessons(
  teacherId: string,
  schoolId?: string,
): Promise<
  ApiActionResponseModel<
    {
      lesson: LessonType;
      events: (EventType & { equipment: any[] })[];
    }[]
  >
> {
  try {
    const lessonsResult = await db.query.lesson.findMany({
      where: eq(lesson.teacherId, teacherId),
      with: {
        events: {
          with: {
            equipmentEvents: {
              with: {
                equipment: true,
              },
            },
          },
        },
      },
    });

    // Transform to include equipment in events
    const lessonsWithEquipment = lessonsResult.map((lessonData) => {
      const eventsWithEquipment = lessonData.events.map((eventData: any) => ({
        ...eventData,
        equipment: eventData.equipmentEvents?.map((ee: any) => ee.equipment) || [],
      }));

      return {
        lesson: lessonData,
        events: eventsWithEquipment,
      };
    });

    // Filter by school if provided
    if (schoolId) {
      const filteredLessons = lessonsWithEquipment.filter(
        (item) => item.lesson.schoolId === schoolId,
      );
      return { success: true, data: filteredLessons };
    }

    return { success: true, data: lessonsWithEquipment };
  } catch (error) {
    console.error("Error fetching teacher lessons:", error);
    return {
      success: false,
      error: `Failed to fetch teacher lessons: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET TEACHER COMMISSIONS WITH LESSONS
export async function getTeacherCommissions(
  teacherId: string,
): Promise<
  ApiActionResponseModel<
    {
      commission: TeacherCommissionType;
      lessons: {
        lesson: LessonType;
        events: EventType[];
      }[];
    }[]
  >
> {
  try {
    const commissionsResult = await db.query.teacherCommission.findMany({
      where: eq(teacherCommission.teacherId, teacherId),
    });

    if (commissionsResult.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch all lessons for this teacher with events and booking info
    const lessonsResult = await db.query.lesson.findMany({
      where: eq(lesson.teacherId, teacherId),
      with: {
        events: true,
        booking: {
          with: {
            studentPackage: {
              with: {
                schoolPackage: true,
              },
            },
            bookingStudents: true,
          },
        },
      },
    });

    // Group lessons by commission
    const commissionsWithLessons = commissionsResult.map((commissionData) => ({
      commission: commissionData,
      lessons: lessonsResult.map((lessonData) => ({
        lesson: lessonData,
        events: lessonData.events || [],
      })),
    }));

    return { success: true, data: commissionsWithLessons };
  } catch (error) {
    console.error("Error fetching teacher commissions:", error);
    return {
      success: false,
      error: `Failed to fetch teacher commissions: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET TEACHER EQUIPMENT
export async function getTeacherEquipment(
  teacherId: string,
): Promise<
  ApiActionResponseModel<
    {
      id: string;
      equipmentId: string;
      active: boolean;
      equipment: any;
    }[]
  >
> {
  try {
    const equipmentRelations = await db.query.teacherEquipment.findMany({
      where: eq(teacherEquipment.teacherId, teacherId),
      with: {
        equipment: true,
      },
    });

    const formattedEquipment = equipmentRelations.map((rel) => ({
      id: rel.id,
      equipmentId: rel.equipmentId,
      active: rel.active,
      equipment: rel.equipment,
    }));

    return { success: true, data: formattedEquipment };
  } catch (error) {
    console.error("Error fetching teacher equipment:", error);
    return {
      success: false,
      error: `Failed to fetch teacher equipment: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// GET TEACHER EVENTS
export async function getTeacherEvents(
  teacherId: string,
  schoolId?: string,
): Promise<ApiActionResponseModel<any[]>> {
  try {
    // Get all lessons for this teacher
    const lessonsResult = await db.query.lesson.findMany({
      where: eq(lesson.teacherId, teacherId),
      with: {
        booking: {
          with: {
            studentPackage: {
              with: {
                schoolPackage: true,
              },
            },
            bookingStudents: {
              with: {
                student: true,
              },
            },
          },
        },
        events: true,
      },
    });

    // Filter by school if provided and extract events
    const filteredLessons = schoolId
      ? lessonsResult.filter((l) => l.schoolId === schoolId)
      : lessonsResult;

    // Extract all events from lessons with booking and student info
    const events = filteredLessons.flatMap((lesson) =>
      lesson.events.map((evt) => ({
        ...evt,
        schoolPackage: lesson.booking?.studentPackage?.schoolPackage,
        students: lesson.booking?.bookingStudents?.map((bs) => bs.student) || [],
      })),
    );

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching teacher events:", error);
    return {
      success: false,
      error: `Failed to fetch teacher events: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
