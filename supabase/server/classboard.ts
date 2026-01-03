"use server";

import { eq, inArray, desc } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { booking, bookingStudent, student, schoolStudents, lesson, teacher, teacherCommission, event } from "@/drizzle/schema";
import { getSchoolHeader } from "@/types/headers";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import { createClassboardModel } from "@/getters/classboard-getter";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import type { ApiActionResponseModel } from "@/types/actions";

/**
 * Fetches a single booking with all its relations using Drizzle relations
 * Returns the full booking with ALL lessons and ALL events (not filtered by date)
 */
export async function getSQLClassboardDataForBooking(bookingId: string): Promise<ApiActionResponseModel<ClassboardModel>> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return {
                success: false,
                error: "School context could not be determined from header.",
            };
        }

        const bookingData = await db.query.booking.findFirst({
            where: eq(booking.id, bookingId),
            with: {
                studentPackage: {
                    with: {
                        schoolPackage: {
                            columns: {
                                id: true,
                                durationMinutes: true,
                                description: true,
                                pricePerStudent: true,
                                capacityStudents: true,
                                capacityEquipment: true,
                                categoryEquipment: true,
                            },
                        },
                    },
                },
                bookingStudents: {
                    with: {
                        student: {
                            columns: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                passport: true,
                                country: true,
                                phone: true,
                                languages: true,
                            },
                            with: {
                                schoolStudents: {
                                    columns: {
                                        description: true,
                                        schoolId: true,
                                    },
                                },
                            },
                        },
                    },
                },
                lessons: {
                    with: {
                        teacher: {
                            columns: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                username: true,
                            },
                        },
                        commission: {
                            columns: {
                                id: true,
                                cph: true,
                                commissionType: true,
                                description: true,
                            },
                        },
                        events: {
                            columns: {
                                id: true,
                                lessonId: true,
                                date: true,
                                duration: true,
                                location: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        if (!bookingData) {
            return { success: true, data: [] };
        }

        const classboardData = createClassboardModel([bookingData]);

        // Convert all event times from UTC to school's local timezone for display
        classboardData.forEach((bd) => {
            bd.lessons?.forEach((lessonData) => {
                lessonData.events?.forEach((evt) => {
                    const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), schoolHeader.zone);
                    evt.date = convertedDate.toISOString();
                });
            });
        });

        return { success: true, data: classboardData };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch booking data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Fetches all classboard data (bookings, students, lessons, events)
 * Uses Drizzle's query builder for type safety and reliability
 */
export async function getSQLClassboardData(): Promise<ApiActionResponseModel<ClassboardModel>> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return {
                success: false,
                error: "School context could not be determined from header. The school may not exist or is not configured correctly.",
            };
        }

        // Query 1: Get bookings with student package
        const bookingsResult = await db.query.booking.findMany({
            where: eq(booking.schoolId, schoolHeader.id),
            columns: {
                id: true,
                dateStart: true,
                dateEnd: true,
                schoolId: true,
                leaderStudentName: true,
                studentPackageId: true,
            },
            with: {
                studentPackage: {
                    with: {
                        schoolPackage: {
                            columns: {
                                id: true,
                                durationMinutes: true,
                                description: true,
                                pricePerStudent: true,
                                capacityStudents: true,
                                capacityEquipment: true,
                                categoryEquipment: true,
                            },
                        },
                    },
                },
            },
            orderBy: [desc(booking.dateStart)],
        });

        const bookingIds = bookingsResult.map((b) => b.id);

        // Query 2: Get all booking students
        const bookingStudents = bookingIds.length > 0
            ? await db.query.bookingStudent.findMany({
                  where: inArray(bookingStudent.bookingId, bookingIds),
                  with: {
                      student: {
                          columns: {
                              id: true,
                              firstName: true,
                              lastName: true,
                              passport: true,
                              country: true,
                              phone: true,
                              languages: true,
                          },
                          with: {
                              schoolStudents: {
                                  columns: {
                                      description: true,
                                      schoolId: true,
                                  },
                              },
                          },
                      },
                  },
              })
            : [];

        // Query 3: Get all lessons with relationships
        const lessons = bookingIds.length > 0
            ? await db.query.lesson.findMany({
                  where: inArray(lesson.bookingId, bookingIds),
                  with: {
                      teacher: {
                          columns: {
                              id: true,
                              firstName: true,
                              lastName: true,
                              username: true,
                          },
                      },
                      commission: {
                          columns: {
                              id: true,
                              cph: true,
                              commissionType: true,
                              description: true,
                          },
                      },
                      events: {
                          columns: {
                              id: true,
                              lessonId: true,
                              date: true,
                              duration: true,
                              location: true,
                              status: true,
                          },
                      },
                  },
              })
            : [];

        // Merge data in memory
        const mergedBookings = bookingsResult.map((b) => ({
            ...b,
            bookingStudents: bookingStudents.filter((bs) => bs.bookingId === b.id),
            lessons: lessons.filter((l) => l.bookingId === b.id),
        }));

        const classboardData: ClassboardModel = createClassboardModel(mergedBookings);

        // Convert all event times from UTC to school's local timezone for display
        classboardData.forEach((bookingData) => {
            bookingData.lessons?.forEach((lessonData) => {
                lessonData.events?.forEach((evt) => {
                    const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), schoolHeader.zone);
                    evt.date = convertedDate.toISOString();
                });
            });
        });

        return { success: true, data: classboardData };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch classboard data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
