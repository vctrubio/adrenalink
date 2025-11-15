"use server";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getSchoolFromHeader } from "@/types/headers";
import { booking, school, event } from "@/drizzle/schema";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { createClassboardModel } from "@/getters/classboard-getter";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import type { ApiActionResponseModel } from "@/types/actions";

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
    try {
        // Get complete school data from x-school-username header (cached)
        const schoolData = await getSchoolFromHeader();
        if (!schoolData) {
            return { success: false, error: "School not found in headers" };
        }

        const result = await db.query.booking.findMany({
            where: eq(booking.schoolId, schoolData.id),
            with: classboardWithRelations,
            orderBy: [desc(booking.createdAt)],
        });

        // console.log("DEV: [classboard-action] Fetched bookings from DB:", result.length);
        result.forEach((b, idx) => {
            if (!b.studentPackage) {
                throw new Error(`❌ Booking ${b.id} MISSING studentPackage - this should not happen!`);
            }
            if (!b.studentPackage.schoolPackage) {
                throw new Error(`❌ Booking ${b.id} - studentPackage missing schoolPackage - this should not happen!`);
            }

            console.log(
                // `DEV: [classboard-action] Booking ${idx} (${b.id}):`,
                JSON.stringify(
                    {
                        // dateStart: b.dateStart,
                        // dateEnd: b.dateEnd,
                        // lessonCount: b.lessons.length,
                        // schoolPackage: b.studentPackage.schoolPackage,
                        // bookingStudents: b.bookingStudents.map((bs) => ({
                        //     student: {
                        //         id: bs.student.id,
                        //         firstName: bs.student.firstName,
                        //         lastName: bs.student.lastName,
                        //         passport: bs.student.passport,
                        //         country: bs.student.country,
                        //         phone: bs.student.phone,
                        //     },
                        // })),
                        lessons: b.lessons.map((lesson) => ({
                            // id: lesson.id,
                            teacherUsername: lesson.teacher.username,
                            events: lesson.events.map((e) => ({
                                date: e.date,
                                duration: e.duration,
                                // location: e.location,
                                // status: e.status,
                            })),
                        })),
                    },
                    null,
                    2,
                ),
            );
        });

        const bookings: ClassboardModel = createClassboardModel(result);

        // Convert all event times from UTC to school's local timezone for display
        if (schoolData.timezone) {
            Object.values(bookings).forEach((bookingData) => {
                bookingData.lessons?.forEach((lesson) => {
                    lesson.events?.forEach((event) => {
                        // Convert UTC time to school timezone
                        const convertedDate = convertUTCToSchoolTimezone(new Date(event.date), schoolData.timezone);
                        event.date = convertedDate.toISOString();
                    });
                });
            });
        }

        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching classboard bookings:", error);
        return { success: false, error: `Failed to fetch classboard bookings: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function createClassboardEvent(lessonId: string, eventDate: string, duration: number, location: string): Promise<ApiActionResponseModel<{ id: string; date: string; duration: number; location: string; status: string }>> {
    try {
        // Get school data from header (has timezone)
        const schoolData = await getSchoolFromHeader();
        if (!schoolData?.timezone) {
            return { success: false, error: "School timezone not configured" };
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
            timeZone: schoolData.timezone,
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
                schoolId: schoolData.id,
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
            timezone: schoolData.timezone,
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

export async function deleteClassboardEvent(eventId: string, cascade: boolean = false): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`🗑️ [classboard-action] Deleting event ${eventId}, cascade: ${cascade}`);

        // Find the event to get its details
        const eventToDelete = await db.query.event.findFirst({
            where: eq(event.id, eventId),
            columns: {
                id: true,
                date: true,
                duration: true,
                lessonId: true,
            },
        });

        if (!eventToDelete) {
            return { success: false, error: "Event not found" };
        }

        // Delete the event
        await db.delete(event).where(eq(event.id, eventId));

        console.log(`✅ [classboard-action] Event deleted: ${eventId}`);

        // If cascade is enabled, we would shift all subsequent events
        // For now, this is a basic delete. Cascade logic would be implemented
        // in the frontend and batch updated via a separate action
        if (cascade) {
            console.log("📝 [classboard-action] Cascade flag set - frontend should handle shifting subsequent events");
        }

        // No revalidatePath needed - real-time listener handles updates

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error deleting event:", error);
        return { success: false, error: `Failed to delete event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

interface EventUpdate {
    id: string;
    date: string;
    duration: number;
}

export async function batchUpdateClassboardEvents(updates: EventUpdate[]): Promise<ApiActionResponseModel<{ success: boolean; updatedCount: number }>> {
    try {
        console.log(`📝 [classboard-action] Batch updating ${updates.length} events`);

        // Update each event
        let updatedCount = 0;
        for (const update of updates) {
            await db
                .update(event)
                .set({
                    date: new Date(update.date),
                    duration: update.duration,
                })
                .where(eq(event.id, update.id));
            updatedCount++;
        }

        console.log(`✅ [classboard-action] Batch update complete: ${updatedCount} events updated`);

        // No revalidatePath needed - real-time listener handles updates

        return { success: true, data: { success: true, updatedCount } };
    } catch (error) {
        console.error("❌ [classboard-action] Error batch updating events:", error);
        return { success: false, error: `Failed to batch update events: ${error instanceof Error ? error.message : String(error)}` };
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
