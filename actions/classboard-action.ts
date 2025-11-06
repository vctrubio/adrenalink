"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { booking, school } from "@/drizzle/schema";
import { createClassboardModel, type ClassboardModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const classboardWithRelations = {
    studentPackage: {
        with: {
            schoolPackage: {
                columns: {
                    durationMinutes: true,
                    description: true,
                    pricePerStudent: true,
                    capacityStudents: true,
                    capacityEquipment: true,
                    categoryEquipment: true,
                    packageType: true,
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
        
        let result;
        if (schoolUsername) {
            // School mode: Filter bookings by school username
            const schoolWithUsername = await db.query.school.findFirst({
                where: eq(school.username, schoolUsername),
                columns: { id: true }
            });
            
            if (schoolWithUsername) {
                result = await db.query.booking.findMany({
                    where: eq(booking.schoolId, schoolWithUsername.id),
                    with: classboardWithRelations,
                    orderBy: [desc(booking.createdAt)]
                });
            } else {
                result = [];
            }
        } else {
            // Sudo mode: Get ALL bookings (full privileges)
            result = await db.query.booking.findMany({
                with: classboardWithRelations,
                orderBy: [desc(booking.createdAt)]
            });
        }
        
        const bookings: ClassboardModel = createClassboardModel(result);
        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching classboard bookings:", error);
        return { success: false, error: `Failed to fetch classboard bookings: ${error instanceof Error ? error.message : String(error)}` };
    }
}
