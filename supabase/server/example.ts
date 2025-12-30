import { db } from "@/drizzle/db";
import { event, lesson, teacher, booking, studentPackage, schoolPackage, bookingStudent, student, teacherCommission } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getExampleEventData(eventId: string) {
    try {
        const result = await db.query.event.findFirst({
            where: eq(event.id, eventId),
            with: {
                lesson: {
                    with: {
                        teacher: {
                            with: {
                                school: true,
                            }
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
                                    }
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

        // Manually reconstruct the object to ensure clean serialization
        const cleanData = JSON.parse(JSON.stringify(result));

        return { success: true, data: cleanData };
    } catch (error) {
        console.error("Error fetching example event data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
