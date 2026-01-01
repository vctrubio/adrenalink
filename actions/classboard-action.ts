"use server";

import { unstable_noStore as noStore } from "next/cache";
import { desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";
import { booking, school, event, lesson, bookingStudent, student, teacher, teacherCommission } from "@/drizzle/schema";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { createClassboardModel } from "@/getters/classboard-getter";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import type { ApiActionResponseModel } from "@/types/actions";
import { debug, trackPerformance } from "@/utils/debug";

const classboardWithRelations = {
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
} as const;

export async function getClassboardBookings(): Promise<ApiActionResponseModel<ClassboardModel>> {
    noStore(); //idk if...we.need this

    try {
        // debug.performance("getClassboardBookings start", 0, { step: "initialization" });

        // Get school context from header (cached, returns {id, name, zone})
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            debug.warn("No school header found in getClassboardBookings");
            return {
                success: false,
                error: "School context could not be determined from header. The school may not exist or is not configured correctly.",
            };
        }

        debug.cache("getSchoolHeader", true, { schoolId: schoolHeader.id });

        // OPTIMIZED: Split into 2 simpler queries instead of 1 massive nested query
        // Query 1: Get bookings with student package (simple join)
        const bookingsQuery = async () => {
            const startTime = Date.now();
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
                orderBy: [desc(booking.createdAt)],
                limit: 50, // Pagination limit
            });
            const duration = Date.now() - startTime;
            // debug.query("Bookings query (optimized)", duration, { count: bookingsResult.length });
            return bookingsResult;
        };

        // Query 2: Get all booking students
        const bookingStudentsQuery = async (bookingIds: string[]) => {
            if (bookingIds.length === 0) return [];
            const startTime = Date.now();
            const result = await db.query.bookingStudent.findMany({
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
                                // Removed where clause - filter in memory after query
                            },
                        },
                    },
                },
            });
            const duration = Date.now() - startTime;
            // debug.query("Booking students query (optimized)", duration, { count: result.length });
            return result;
        };

        // Query 3: Get all lessons with relationships
        const lessonsQuery = async (bookingIds: string[]) => {
            if (bookingIds.length === 0) return [];
            const startTime = Date.now();
            const result = await db.query.lesson.findMany({
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
            });
            const duration = Date.now() - startTime;
            // debug.query("Lessons query (optimized)", duration, { count: result.length });
            return result;
        };

        // Execute queries in parallel
        const bookingsResult = await trackPerformance(
            "Bookings data fetch",
            bookingsQuery,
            3000
        );

        const bookingIds = bookingsResult.map(b => b.id);

        const [bookingStudents, lessons] = await Promise.all([
            trackPerformance("Booking students fetch", () => bookingStudentsQuery(bookingIds), 3000),
            trackPerformance("Lessons fetch", () => lessonsQuery(bookingIds), 3000),
        ]);

        // Merge data in memory
        const mergedBookings = bookingsResult.map(b => ({
            ...b,
            bookingStudents: bookingStudents.filter(bs => bs.bookingId === b.id),
            lessons: lessons.filter(l => l.bookingId === b.id),
        }));

        const result = mergedBookings;

        // Validate data
        result.forEach((b) => {
            if (!b.studentPackage) {
                throw new Error(`❌ Booking ${b.id} MISSING studentPackage`);
            }
            if (!b.studentPackage.schoolPackage) {
                throw new Error(`❌ Booking ${b.id} - studentPackage missing schoolPackage`);
            }
            // Validate every lesson has commission
            b.lessons.forEach((l) => {
                if (!l.commission) {
                    throw new Error(`❌ Lesson ${l.id} in booking ${b.id} MISSING commission`);
                }
            });
        });

        const bookings: ClassboardModel = createClassboardModel(result);

        // Convert all event times from UTC to school's local timezone for display
        Object.values(bookings).forEach((bookingData) => {
            bookingData.lessons?.forEach((lessonData) => {
                lessonData.events?.forEach((evt) => {
                    const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), schoolHeader.zone);
                    evt.date = convertedDate.toISOString();
                });
            });
        });

        // debug.performance("getClassboardBookings complete", 0, { bookingCount: Object.keys(bookings).length });
        return { success: true, data: bookings };
    } catch (error) {
        debug.warn("Error fetching classboard bookings", { error: error instanceof Error ? error.message : String(error) });
        return { success: false, error: `Failed to fetch classboard bookings: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function createClassboardEvent(lessonId: string, eventDate: string, duration: number, location: string): Promise<ApiActionResponseModel<{ id: string; date: string; duration: number; location: string; status: string }>> {
    try {
        // Get school context from header (returns {id, name, zone})
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found or timezone not configured." };
        }

        // Parse input: "2025-11-14T14:00:00"
        const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):/);
        if (!dateMatch) {
            return { success: false, error: "Invalid event date format" };
        }

        const [, year, month, day, hours, minutes] = dateMatch;
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}:00`;

        // Calculate UTC time from school local time
        // Input is school's local time, need to convert to UTC for storage
        const midnightUtc = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));

        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: schoolHeader.zone, // Use 'zone' for the timezone
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const displayedTime = formatter.format(midnightUtc);
        const [displayHours, displayMinutes] = displayedTime.split(":").map(Number);

        // Calculate offset: how many minutes ahead is the school's midnight vs UTC midnight
        const offsetTotalMinutes = displayHours * 60 + displayMinutes;

        // Convert school time to UTC by subtracting the offset
        const schoolTotalMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const utcTotalMinutes = schoolTotalMinutes - offsetTotalMinutes;

        const utcHours = Math.floor(utcTotalMinutes / 60) % 24;
        const utcMins = utcTotalMinutes % 60;
        const utcTimeStr = `${String(utcHours).padStart(2, "0")}:${String(utcMins).padStart(2, "0")}:00`;

        // Store as UTC in database
        const result = await db
            .insert(event)
            .values({
                lessonId,
                schoolId: schoolHeader.id, // Use 'id' for the school ID
                date: new Date(`${dateStr}T${utcTimeStr}Z`), // Store as UTC
                duration,
                location,
                status: "planned",
            })
            .returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Failed to create event" };
        }

        console.log("✅ [Event Created]", {
            schoolTime: timeStr,
            utcTime: utcTimeStr,
            timezone: schoolHeader.zone,
        });

        return {
            success: true,
            data: {
                id: result[0].id,
                date: result[0].date.toISOString(),
                duration: result[0].duration,
                location: result[0].location,
                status: result[0].status,
            },
        };
    } catch (error) {
        console.error("❌ [classboard-action] Error creating event:", error);
        return { success: false, error: `Failed to create event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function deleteClassboardEvent(eventId: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`🗑️ [classboard-action] Deleting event ${eventId}`);

        // Find the event to verify it exists
        const eventToDelete = await db.query.event.findFirst({
            where: eq(event.id, eventId),
            columns: {
                id: true,
            },
        });

        if (!eventToDelete) {
            return { success: false, error: "Event not found" };
        }

        // Delete the event
        await db.delete(event).where(eq(event.id, eventId));

        console.log(`✅ [classboard-action] Event deleted: ${eventId}`);

        // No revalidatePath needed - real-time listener handles updates

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error deleting event:", error);
        return { success: false, error: `Failed to delete event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function updateClassboardEventLocation(eventId: string, location: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`📍 [classboard-action] Updating event ${eventId} location to ${location}`);

        const result = await db.update(event).set({ location }).where(eq(event.id, eventId)).returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard-action] Event location updated: ${eventId} -> ${location}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error updating event location:", error);
        return { success: false, error: `Failed to update event location: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event start time (used by EventCard for immediate gap corrections)
 */
export async function updateEventStartTime(eventId: string, newDate: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`⏰ [classboard-action] Updating event ${eventId} start time to ${newDate}`);

        const result = await db
            .update(event)
            .set({ date: new Date(newDate) })
            .where(eq(event.id, eventId))
            .returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard-action] Event start time updated: ${eventId} -> ${newDate}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error updating event start time:", error);
        return { success: false, error: `Failed to update event start time: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event status
 */
export async function updateEventStatus(eventId: string, status: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`📍 [classboard-action] Updating event ${eventId} status to ${status}`);

        const result = await db.update(event).set({ status }).where(eq(event.id, eventId)).returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard-action] Event status updated: ${eventId} -> ${status}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error updating event status:", error);
        return { success: false, error: `Failed to update event status: ${error instanceof Error ? error.message : String(error)}` };
    }
}
