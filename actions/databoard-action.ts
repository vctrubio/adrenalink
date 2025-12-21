import { eq, exists, and, count } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";
import { student, school, schoolStudents, teacher, booking, equipment, event, schoolPackage } from "@/drizzle/schema";
import { createStudentModel, createTeacherModel, createBookingModel, createEquipmentModel, createEventModel, createSchoolPackageModel, type StudentModel, type TeacherModel, type BookingModel, type EquipmentModel, type EventModel, type SchoolPackageModel } from "@/backend/models";
import { buildStudentStatsQuery, buildTeacherStatsQuery, buildBookingStatsQuery, buildEquipmentStatsQuery, createStatsMap } from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

export async function getDataboardCounts(): Promise<ApiActionResponseModel<Record<string, number>>> {
    try {
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

        const whereCondition = (table: any) => (schoolId ? eq(table.schoolId, schoolId) : undefined);

        const [
            studentCount,
            teacherCount,
            bookingCount,
            equipmentCount,
            packageCount,
        ] = await Promise.all([
            db.select({ value: count() }).from(student).where(schoolId ? exists(db.select().from(schoolStudents).where(and(eq(schoolStudents.studentId, student.id), eq(schoolStudents.schoolId, schoolId)))) : undefined),
            db.select({ value: count() }).from(teacher).where(whereCondition(teacher)),
            db.select({ value: count() }).from(booking).where(whereCondition(booking)),
            db.select({ value: count() }).from(equipment).where(whereCondition(equipment)),
            db.select({ value: count() }).from(schoolPackage).where(whereCondition(schoolPackage)),
        ]);
        
        const data = {
            student: studentCount[0].value,
            teacher: teacherCount[0].value,
            booking: bookingCount[0].value,
            equipment: equipmentCount[0].value,
            schoolPackage: packageCount[0].value,
        };

        return { success: true, data };

    } catch (error) {
        console.error("Error fetching databoard counts:", error);
        return { success: false, error: "Failed to fetch databoard counts" };
    }
}
// GET STUDENTS
export async function getStudents(): Promise<ApiActionResponseModel<StudentModel[]>> {
    try {
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

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
                      schoolStudents: true,
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
                      schoolStudents: true,
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
            ...createStudentModel(studentData, schoolId),
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
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

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
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

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
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

        // 1. Fetch ONLY display data (shallow relations for teachers with lessons)
        const whereCondition = schoolId ? eq(equipment.schoolId, schoolId) : undefined;

        const equipmentsQuery = db.query.equipment.findMany({
                  where: whereCondition,
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

// GET EVENTS
export async function getEvents(): Promise<ApiActionResponseModel<EventModel[]>> {
    try {
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

        // 1. Fetch events with lesson and teacher relations
        const eventWithRelations = {
            lesson: {
                with: {
                    teacher: true,
                    commission: true, // <-- Add this line
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
            },
        };

        const eventsQuery = schoolId
            ? db.query.event.findMany({
                  where: eq(event.schoolId, schoolId),
                  with: eventWithRelations,
              })
            : db.query.event.findMany({
                  with: eventWithRelations,
              });

        // 2. Execute query
        const eventsResult = await eventsQuery;

        // 3. Create models
        const events: EventModel[] = eventsResult.map((eventData) => createEventModel(eventData));

        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { success: false, error: `Failed to fetch events: ${error instanceof Error ? error.message : String(error)}` };
    }
}

// GET SCHOOL PACKAGES
export async function getSchoolPackages(): Promise<ApiActionResponseModel<SchoolPackageModel[]>> {
    try {
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

        const packagesQuery = schoolId
            ? db.query.schoolPackage.findMany({
                  where: eq(schoolPackage.schoolId, schoolId),
              })
            : db.query.schoolPackage.findMany();

        const packagesResult = await packagesQuery;
        const packages: SchoolPackageModel[] = packagesResult.map((pkgData) => createSchoolPackageModel(pkgData));

        return { success: true, data: packages };
    } catch (error) {
        console.error("Error fetching school packages:", error);
        return { success: false, error: "Failed to fetch school packages" };
    }
}

