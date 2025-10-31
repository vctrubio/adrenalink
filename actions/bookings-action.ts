"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { booking, school, type BookingForm, type BookingType } from "@/drizzle/schema";
import { createBookingModel, type BookingModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const bookingWithRelations = {
    schoolPackage: true,
    school: true,
    studentPackage: true,
    bookingStudents: {
        with: {
            student: true,
        },
    },
    lessons: {
        with: {
            teacher: true,
            commission: true,
            events: {
                with: {
                    equipmentEvents: {
                        with: {
                            equipment: true,
                        },
                    },
                },
            },
            payments: true,
        },
    },
};

// CREATE
export async function createBooking(bookingSchema: BookingForm): Promise<ApiActionResponseModel<BookingType>> {
    try {
        const result = await db.insert(booking).values(bookingSchema).returning();
        revalidatePath("/bookings");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false, error: "Failed to create booking" };
    }
}

// READ
export async function getBookings(): Promise<ApiActionResponseModel<BookingModel[]>> {
    try {
        const header = await getHeaderUsername();
        
        let result;
        if (header) {
            // Filter bookings by school username
            const schoolWithUsername = await db.query.school.findFirst({
                where: eq(school.username, header),
                columns: { id: true }
            });
            
            if (schoolWithUsername) {
                result = await db.query.booking.findMany({
                    where: eq(booking.schoolId, schoolWithUsername.id),
                    with: bookingWithRelations
                });
            } else {
                result = [];
            }
        } else {
            // Global query (admin mode)
            result = await db.query.booking.findMany({
                with: bookingWithRelations
            });
        }
        
        const bookings: BookingModel[] = result.map(bookingData => createBookingModel(bookingData));
        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return { success: false, error: "Failed to fetch bookings" };
    }
}

export async function getBookingById(id: string): Promise<ApiActionResponseModel<BookingModel>> {
    try {
        const result = await db.query.booking.findFirst({
            where: eq(booking.id, id),
            with: bookingWithRelations
        });
        
        if (result) {
            return { success: true, data: createBookingModel(result) };
        }
        return { success: false, error: "Booking not found" };
    } catch (error) {
        console.error("Error fetching booking:", error);
        return { success: false, error: "Failed to fetch booking" };
    }
}

export async function getBookingsBySchoolId(schoolId: string): Promise<ApiActionResponseModel<BookingModel[]>> {
    try {
        const result = await db.query.booking.findMany({
            where: eq(booking.schoolId, schoolId),
            with: bookingWithRelations
        });
        
        const bookings: BookingModel[] = result.map(bookingData => createBookingModel(bookingData));
        
        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching bookings by school ID:", error);
        return { success: false, error: "Failed to fetch bookings" };
    }
}

export async function getBookingsByPackageId(packageId: string): Promise<ApiActionResponseModel<BookingModel[]>> {
    try {
        const result = await db.query.booking.findMany({
            where: eq(booking.packageId, packageId),
            with: bookingWithRelations
        });
        
        const bookings: BookingModel[] = result.map(bookingData => createBookingModel(bookingData));
        
        return { success: true, data: bookings };
    } catch (error) {
        console.error("Error fetching bookings by package ID:", error);
        return { success: false, error: "Failed to fetch bookings" };
    }
}

// UPDATE
export async function updateBooking(id: string, bookingSchema: Partial<BookingForm>): Promise<ApiActionResponseModel<BookingType>> {
    try {
        const updateData = {
            ...bookingSchema,
            updatedAt: new Date().toISOString()
        };
        const result = await db.update(booking).set(updateData).where(eq(booking.id, id)).returning();
        revalidatePath("/bookings");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating booking:", error);
        return { success: false, error: "Failed to update booking" };
    }
}

// DELETE
export async function deleteBooking(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(booking).where(eq(booking.id, id));
        revalidatePath("/bookings");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { success: false, error: "Failed to delete booking" };
    }
}