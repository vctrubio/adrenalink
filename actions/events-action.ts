"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { event, type EventForm, type EventType } from "@/drizzle/schema";
import { createEventModel, type EventModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const eventWithRelations = {
    lesson: {
        with: {
            teacher: true,
            commission: true,
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
    equipmentEvents: {
        with: {
            equipment: true,
        },
    },
};

// CREATE
export async function createEvent(eventSchema: EventForm): Promise<ApiActionResponseModel<EventType>> {
    try {
        const result = await db.insert(event).values(eventSchema).returning();
        revalidatePath("/events");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

// READ
export async function getEvents(): Promise<ApiActionResponseModel<EventModel[]>> {
    try {
        const result = await db.query.event.findMany({
            with: eventWithRelations,
        });

        const events: EventModel[] = result.map((eventData) => {
            return createEventModel(eventData);
        });

        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

export async function getEventById(id: string): Promise<ApiActionResponseModel<EventModel>> {
    try {
        const result = await db.query.event.findFirst({
            where: eq(event.id, id),
            with: eventWithRelations,
        });

        if (result) {
            return { success: true, data: createEventModel(result) };
        }
        return { success: false, error: "Event not found" };
    } catch (error) {
        console.error("Error fetching event:", error);
        return { success: false, error: "Failed to fetch event" };
    }
}

// UPDATE
export async function updateEvent(id: string, eventSchema: Partial<EventForm>): Promise<ApiActionResponseModel<EventType>> {
    try {
        const result = await db.update(event).set(eventSchema).where(eq(event.id, id)).returning();
        revalidatePath("/events");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: "Failed to update event" };
    }
}

// DELETE
export async function deleteEvent(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(event).where(eq(event.id, id));
        revalidatePath("/events");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

// RELATIONS
export async function getEventsByLessonId(lessonId: string): Promise<ApiActionResponseModel<EventModel[]>> {
    try {
        const result = await db.query.event.findMany({
            where: eq(event.lessonId, lessonId),
            with: eventWithRelations,
        });

        const events: EventModel[] = result.map((eventData) => {
            return createEventModel(eventData);
        });

        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching events by lesson ID:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

// FULL USER STORY (Example Route)
export async function getEventUserStory(eventId: string): Promise<ApiActionResponseModel<any>> {
    try {
        const result = await db.query.event.findFirst({
            where: eq(event.id, eventId),
            with: {
                lesson: {
                    with: {
                        teacher: {
                            with: {
                                school: true,
                            },
                        },
                        commission: true,
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
                    },
                },
                equipmentEvents: {
                    with: {
                        equipment: true,
                    },
                },
            },
        });

        if (!result) {
            return { success: false, error: "Event not found" };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching event user story:", error);
        return { success: false, error: "Failed to fetch event user story" };
    }
}
