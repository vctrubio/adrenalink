"use server";

import { eq, exists, and } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { student, school, schoolStudents, teacher, booking, equipment } from "@/drizzle/schema";
import { createStudentModel, createTeacherModel, createBookingModel, createEquipmentModel, type StudentModel, type TeacherModel, type BookingModel, type EquipmentModel } from "@/backend/models";
import { buildStudentStatsQuery, buildTeacherStatsQuery, buildBookingStatsQuery, buildEquipmentStatsQuery, createStatsMap } from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

// GET STUDENTS
export async function getStudents(): Promise<ApiActionResponseModel<StudentModel[]>> {
    try {
        const header = await getHeaderUsername();

        let schoolId: string | undefined;
        if (header) {
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });
            if (!schoolData) {
                return { success: true, data: [] };
            }
            schoolId = schoolData.id;
        }

        // 1. Fetch shallow ORM relations (for row-action tags and popover)
        const studentsQuery = schoolId
            ? db.query.student.findMany({
                  where: exists(
                      db
                          .select()
                          .from(schoolStudents)
                          .where(and(eq(schoolStudents.studentId, student.id), eq(schoolStudents.schoolId, schoolId))),
                  ),
                  with: {
                      bookingStudents: {
                          with: {
                              booking: true,
                          },
                      },
                      studentPackageStudents: {
                          with: {
                              studentPackage: true,
                          },
                      },
                  },
              })
            : db.query.student.findMany({
                  with: {
                      bookingStudents: {
                          with: {
                              booking: true,
                          },
                      },
                      studentPackageStudents: {
                          with: {
                              studentPackage: true,
                          },
                      },
                  },
              });

        // 2. Execute ORM query and SQL stats in parallel
        const statsQuery = db.execute(buildStudentStatsQuery(schoolId));
        const [studentsResult, statsResult] = await Promise.all([studentsQuery, statsQuery]);

        // 3. Create stats map for quick lookup
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Merge stats into models
        const students: StudentModel[] = studentsResult.map((studentData) => ({
            ...createStudentModel(studentData),
            stats: statsMap.get(studentData.id),
        }));

        return { success: true, data: students };
    } catch (error) {
        console.error("Error fetching students:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}

// GET TEACHERS
export async function getTeachers(): Promise<ApiActionResponseModel<TeacherModel[]>> {
    try {
        const header = await getHeaderUsername();

        let schoolId: string | undefined;
        if (header) {
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });
            if (!schoolData) {
                return { success: true, data: [] };
            }
            schoolId = schoolData.id;
        }

        // 1. Fetch ORM relations (lessons with events for row-action tags)
        const teachersQuery = schoolId
            ? db.query.teacher.findMany({
                  where: eq(teacher.schoolId, schoolId),
                  with: {
                      lessons: {
                          with: {
                              events: true,
                          },
                      },
                  },
              })
            : db.query.teacher.findMany({
                  with: {
                      lessons: {
                          with: {
                              events: true,
                          },
                      },
                  },
              });

        // 2. Execute ORM query and SQL stats in parallel
        const statsQuery = db.execute(buildTeacherStatsQuery(schoolId));
        const [teachersResult, statsResult] = await Promise.all([teachersQuery, statsQuery]);

        // 3. Create stats map
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Merge stats into models
        const teachers: TeacherModel[] = teachersResult.map((teacherData) => ({
            ...createTeacherModel(teacherData),
            stats: statsMap.get(teacherData.id),
        }));

        return { success: true, data: teachers };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return { success: false, error: "Failed to fetch teachers" };
    }
}

// GET BOOKINGS
export async function getBookings(): Promise<ApiActionResponseModel<BookingModel[]>> {
    try {
        const header = await getHeaderUsername();

        let schoolId: string | undefined;
        if (header) {
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });
            if (!schoolData) {
                return { success: true, data: [] };
            }
            schoolId = schoolData.id;
        }

        // 1. Fetch ORM relations (for row-action tags and row-str details)
        const bookingsQuery = schoolId
            ? db.query.booking.findMany({
                  where: eq(booking.schoolId, schoolId),
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
              })
            : db.query.booking.findMany({
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

        // 2. Execute ORM query and SQL stats in parallel
        const statsQuery = db.execute(buildBookingStatsQuery(schoolId));
        const [bookingsResult, statsResult] = await Promise.all([bookingsQuery, statsQuery]);

        // 3. Create stats map
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Merge stats into models
        const bookings: BookingModel[] = bookingsResult.map((bookingData) => {
            const baseModel = createBookingModel(bookingData);
            const stats = statsMap.get(bookingData.id);

            // Determine if popover should show (booking is complete)
            let popoverType: "booking_completion" | undefined = undefined;
            const actualMinutes = stats?.total_duration_minutes || 0;
            const requiredMinutes = bookingData.studentPackage?.schoolPackage?.durationMinutes || 0;

            if (requiredMinutes > 0 && actualMinutes >= requiredMinutes) {
                popoverType = "booking_completion";
            }

            return {
                ...baseModel,
                stats,
                popoverType,
            };
        });

        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return { success: false, error: "Failed to fetch bookings" };
    }
}

// GET EQUIPMENTS
export async function getEquipments(): Promise<ApiActionResponseModel<EquipmentModel[]>> {
    try {
        const header = await getHeaderUsername();

        let schoolId: string | undefined;
        if (header) {
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });

            if (!schoolData) {
                return { success: true, data: [] };
            }
            schoolId = schoolData.id;
        }

        // 1. Fetch ONLY display data (shallow relations for teachers with lessons)
        const equipmentsQuery = schoolId
            ? db.query.equipment.findMany({
                  where: eq(equipment.schoolId, schoolId),
                  with: {
                      teacherEquipments: {
                          with: {
                              teacher: {
                                  with: {
                                      lessons: {
                                          with: {
                                              events: true,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                      equipmentRepairs: true,
                  },
              })
            : db.query.equipment.findMany({
                  with: {
                      teacherEquipments: {
                          with: {
                              teacher: {
                                  with: {
                                      lessons: {
                                          with: {
                                              events: true,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                      equipmentRepairs: true,
                  },
              });

        // 2. SQL stats query
        const statsQuery = db.execute(buildEquipmentStatsQuery(schoolId));

        // 3. Execute ORM query and SQL stats in parallel
        const [equipmentsResult, statsResult] = await Promise.all([equipmentsQuery, statsQuery]);

        // 4. Create stats map and calculate teacher hours from relations
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const baseStatsMap = createStatsMap(statsRows);

        // 5. Attach stats to equipment models and add teacher hours from relations
        const equipments: EquipmentModel[] = equipmentsResult.map((equipmentData: any) => {
            const model = createEquipmentModel(equipmentData);
            const baseStats = baseStatsMap.get(equipmentData.id) || {
                events_count: 0,
                total_duration_minutes: 0,
                rentals_count: 0,
                money_in: 0,
                money_out: 0,
            };

            // Calculate teacher hours from relations
            const teacherHours: Record<string, number> = {};
            const teacherEquipments = equipmentData.teacherEquipments || [];
            for (const te of teacherEquipments) {
                if (te.teacher) {
                    const lessons = te.teacher.lessons || [];
                    const totalMinutes = lessons.reduce((sum: number, lesson: any) => {
                        const events = lesson.events || [];
                        return sum + events.reduce((eventSum: number, event: any) => eventSum + (event.duration || 0), 0);
                    }, 0);
                    teacherHours[te.teacher.id] = totalMinutes;
                }
            }

            return { ...model, stats: { ...baseStats, teacherHours } };
        });

        return { success: true, data: equipments };
    } catch (error) {
        console.error("Error fetching equipments:", error);
        return { success: false, error: `Failed to fetch equipments: ${error instanceof Error ? error.message : String(error)}` };
    }
}
