"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { revalidatePath } from "next/cache";
import { getHeaderUsername, getSchoolIdFromHeader } from "@/types/headers";
import { booking, school, event } from "@/drizzle/schema";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { createClassboardModel } from "@/getters/classboard-getter";
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
            student: true as const,
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
        const schoolUsername = await getHeaderUsername();

        if (!schoolUsername) {
            return { success: false, error: "School context not found" };
        }

        const schoolWithUsername = await db.query.school.findFirst({
            where: eq(school.username, schoolUsername),
            columns: { id: true }
        });

        if (!schoolWithUsername) {
            return { success: false, error: "School not found" };
        }

        const result = await db.query.booking.findMany({
            where: eq(booking.schoolId, schoolWithUsername.id),
            with: classboardWithRelations,
            orderBy: [desc(booking.createdAt)]
        });

        console.log("DEV: [classboard-action] Fetched bookings from DB:", result.length);
        result.forEach((b, idx) => {
            if (!b.studentPackage) {
                throw new Error(`❌ Booking ${b.id} MISSING studentPackage - this should not happen!`);
            }
            if (!b.studentPackage.schoolPackage) {
                throw new Error(`❌ Booking ${b.id} - studentPackage missing schoolPackage - this should not happen!`);
            }

            console.log(`DEV: [classboard-action] Booking ${idx} (${b.id}):`, JSON.stringify({
                dateStart: b.dateStart,
                dateEnd: b.dateEnd,
                lessonCount: b.lessons.length,
                schoolPackage: b.studentPackage.schoolPackage,
                bookingStudents: b.bookingStudents.map((bs) => ({
                    student: {
                        id: bs.student.id,
                        firstName: bs.student.firstName,
                        lastName: bs.student.lastName,
                        passport: bs.student.passport,
                        country: bs.student.country,
                        phone: bs.student.phone,
                    }
                })),
                lessons: b.lessons.map((lesson) => ({
                    id: lesson.id,
                    teacherUsername: lesson.teacher.username,
                    events: lesson.events.map((e) => ({
                        date: e.date,
                        duration: e.duration,
                        location: e.location,
                        status: e.status,
                    })),
                })),
            }, null, 2));
        });

        const bookings: ClassboardModel = createClassboardModel(result);
        console.log("DEV: [classboard-action] ✅ Created ClassboardModel with:", Object.keys(bookings).length, "bookings");

        // Debug: Check student data in created model
        Object.entries(bookings).forEach(([bookingId, bookingData]) => {
            console.log(`DEV: [classboard-action] Model booking ${bookingId} students:`, JSON.stringify(
                bookingData.bookingStudents.map((bs) => bs.student),
                null,
                2
            ));
        });

        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching classboard bookings:", error);
        return { success: false, error: `Failed to fetch classboard bookings: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function createClassboardEvent(
    lessonId: string,
    eventDate: string,
    duration: number,
    location: string
): Promise<ApiActionResponseModel<{ id: string; date: string; duration: number; location: string; status: string }>> {
    try {
        console.log(`📝 [classboard-action] Creating event for lesson ${lessonId.substring(0, 8)}`);

        // Get school_id from headers for Realtime filtering
        const schoolId = await getSchoolIdFromHeader();
        if (!schoolId) {
            return { success: false, error: "School not found in headers" };
        }

        // Parse the eventDate with timezone information
        // The eventDate is expected to be an ISO string that includes timezone info
        const eventDateTime = new Date(eventDate);

        console.log(`📍 [classboard-action] Event timezone info:`, {
            inputDate: eventDate,
            parsedDate: eventDateTime.toISOString(),
            timezoneOffset: eventDateTime.getTimezoneOffset(),
        });

        const result = await db
            .insert(event)
            .values({
                lessonId,
                schoolId,
                date: eventDateTime,
                duration,
                location,
                status: "planned",
            })
            .returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Failed to create event" };
        }

        const createdEvent = result[0];
        console.log(`✅ [classboard-action] Event created with timezone:`, {
            id: createdEvent.id.substring(0, 8),
            date: createdEvent.date.toISOString(),
            duration: createdEvent.duration,
            location: createdEvent.location,
        });

        return {
            success: true,
            data: {
                id: createdEvent.id,
                date: createdEvent.date.toISOString(),
                duration: createdEvent.duration,
                location: createdEvent.location,
                status: createdEvent.status,
            },
        };
    } catch (error) {
        console.error(`❌ [classboard-action] Error creating event:`, error);
        return { success: false, error: `Failed to create event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function deleteClassboardEvent(
    eventId: string,
    cascade: boolean = false
): Promise<ApiActionResponseModel<{ success: boolean }>> {
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
            console.log(`📝 [classboard-action] Cascade flag set - frontend should handle shifting subsequent events`);
        }

        revalidatePath("/classboard");

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error(`❌ [classboard-action] Error deleting event:`, error);
        return { success: false, error: `Failed to delete event: ${error instanceof Error ? error.message : String(error)}` };
    }
}
