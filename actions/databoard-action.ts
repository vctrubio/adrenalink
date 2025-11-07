"use server";

import { eq, exists, and, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { student, school, schoolStudents, teacher, booking, equipment } from "@/drizzle/schema";
import { createStudentModel, createTeacherModel, createBookingModel, createEquipmentModel, type StudentModel, type TeacherModel, type BookingModel, type EquipmentModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

// GET STUDENTS
export async function getStudents(): Promise<ApiActionResponseModel<StudentModel[]>> {
    try {
        const header = await getHeaderUsername();

        let result;
        if (header) {
            // Filter students by school username
            result = await db.query.student.findMany({
                where: exists(
                    db
                        .select()
                        .from(schoolStudents)
                        .innerJoin(school, eq(schoolStudents.schoolId, school.id))
                        .where(and(eq(schoolStudents.studentId, student.id), eq(school.username, header))),
                ),
                with: {
                    bookingStudents: {
                        with: {
                            booking: {
                                with: {
                                    studentPackage: {
                                        with: {
                                            schoolPackage: true,
                                        },
                                    },
                                    studentPayments: true,
                                    lessons: {
                                        with: {
                                            events: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    studentPackageStudents: {
                        with: {
                            studentPackage: {
                                columns: {
                                    id: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    bookingPayments: true,
                },
            });
        } else {
            // Global query (admin mode)
            result = await db.query.student.findMany({
                with: {
                    bookingStudents: {
                        with: {
                            booking: {
                                with: {
                                    studentPackage: {
                                        with: {
                                            schoolPackage: true,
                                        },
                                    },
                                    studentPayments: true,
                                    lessons: {
                                        with: {
                                            events: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    studentPackageStudents: {
                        with: {
                            studentPackage: {
                                columns: {
                                    id: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    bookingPayments: true,
                },
            });
        }

        const students: StudentModel[] = result.map((studentData) => createStudentModel(studentData));

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

        let result;
        if (header) {
            // Filter teachers by school username
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });

            if (!schoolData) {
                return { success: true, data: [] };
            }

            result = await db.query.teacher.findMany({
                where: eq(teacher.schoolId, schoolData.id),
                with: {
                    lessons: {
                        with: {
                            commission: true,
                            events: true,
                        },
                    },
                },
            });
        } else {
            // Global query (admin mode)
            result = await db.query.teacher.findMany({
                with: {
                    lessons: {
                        with: {
                            commission: true,
                            events: true,
                        },
                    },
                },
            });
        }

        const teachers: TeacherModel[] = result.map((teacherData) => createTeacherModel(teacherData));

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

        let result;
        if (header) {
            // Filter bookings by school username
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });

            if (!schoolData) {
                return { success: true, data: [] };
            }

            result = await db.query.booking.findMany({
                where: eq(booking.schoolId, schoolData.id),
                with: {
                    studentPackage: {
                        with: {
                            schoolPackage: true,
                        },
                    },
                    lessons: {
                        with: {
                            teacher: true,
                            events: true,
                        },
                    },
                    studentPayments: true,
                    bookingStudents: {
                        with: {
                            student: true,
                        },
                    },
                },
            });
        } else {
            // Global query (admin mode)
            result = await db.query.booking.findMany({
                with: {
                    studentPackage: {
                        with: {
                            schoolPackage: true,
                        },
                    },
                    lessons: {
                        with: {
                            teacher: true,
                            events: true,
                        },
                    },
                    studentPayments: true,
                    bookingStudents: {
                        with: {
                            student: true,
                        },
                    },
                },
            });
        }

        const bookings: BookingModel[] = result.map((bookingData) => createBookingModel(bookingData));

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

        // 2. Raw SQL for stats (simplified - no teacher hours, we'll calculate that from relations)
        const statsQuery = db.execute(sql`
            SELECT
                e.id as equipment_id,
                COUNT(DISTINCT ee.id) as events_count,
                COALESCE(SUM(ev.duration), 0) as total_duration_minutes,
                COUNT(DISTINCT r.id) as rentals_count,
                COALESCE(
                    SUM(
                        (sp.price_per_student * sp.capacity_students) *
                        (ev.duration::decimal / NULLIF(sp.duration_minutes, 0))
                    ), 0
                ) as money_in,
                COALESCE(SUM(er.price), 0) as money_out
            FROM equipment e
            LEFT JOIN equipment_event ee ON ee.equipment_id = e.id
            LEFT JOIN event ev ON ev.id = ee.event_id
            LEFT JOIN lesson l ON l.id = ev.lesson_id
            LEFT JOIN booking b ON b.id = l.booking_id
            LEFT JOIN student_package stp ON stp.id = b.student_package_id
            LEFT JOIN school_package sp ON sp.id = stp.package_id
            LEFT JOIN rental r ON r.equipment_id = e.id
            LEFT JOIN equipment_repair er ON er.equipment_id = e.id
            ${schoolId ? sql`WHERE e.school_id = ${schoolId}` : sql``}
            GROUP BY e.id
        `);

        const [equipmentsResult, statsResult] = await Promise.all([equipmentsQuery, statsQuery]);

        // 3. Create a stats map for quick lookup
        const statsMap = new Map();
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        for (const row of statsRows) {
            statsMap.set(row.equipment_id, {
                eventsCount: Number(row.events_count) || 0,
                totalDurationMinutes: Number(row.total_duration_minutes) || 0,
                rentalsCount: Number(row.rentals_count) || 0,
                moneyIn: Number(row.money_in) || 0,
                moneyOut: Number(row.money_out) || 0,
            });
        }

        // 4. Attach stats to equipment models and calculate teacher hours from relations
        const equipments: EquipmentModel[] = equipmentsResult.map((equipmentData: any) => {
            const model = createEquipmentModel(equipmentData);
            const sqlStats = statsMap.get(equipmentData.id) || {
                eventsCount: 0,
                totalDurationMinutes: 0,
                rentalsCount: 0,
                moneyIn: 0,
                moneyOut: 0,
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

            return { ...model, stats: { ...sqlStats, teacherHours } };
        });

        return { success: true, data: equipments };
    } catch (error) {
        console.error("Error fetching equipments:", error);
        return { success: false, error: `Failed to fetch equipments: ${error instanceof Error ? error.message : String(error)}` };
    }
}
