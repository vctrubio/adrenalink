"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { booking, school, type BookingForm, type BookingType } from "@/drizzle/schema";
import { createBookingModel, type BookingModel } from "@/backend/models";
import type { ApiActionResponseModel, ApiActionResponseModelArray } from "@/types/actions";

const bookingWithRelations = {
    schoolPackage: true,
    school: true,
    studentPackage: true,
    bookingStudents: {
        with: {
            student: true
        }
    }
};

// CREATE
export async function createBooking(bookingSchema: BookingForm) {
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
export async function getBookings(): Promise<ApiActionResponseModelArray<BookingType>> {
    try {
        const header = headers().get('x-school-username');
        
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
        
        if (result) {
            const bookings: BookingModel[] = result.map(bookingData => createBookingModel(bookingData));
            return bookings;
        }
        
        return { error: "No bookings found" };
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return { error: "Failed to fetch bookings" };
    }
}

export async function getBookingById(id: string): Promise<ApiActionResponseModel<BookingType>> {
    try {
        const result = await db.query.booking.findFirst({
            where: eq(booking.id, id),
            with: bookingWithRelations
        });
        
        if (result) {
            return createBookingModel(result);
        }
        return { error: "Booking not found" };
    } catch (error) {
        console.error("Error fetching booking:", error);
        return { error: "Failed to fetch booking" };
    }
}

export async function getBookingsBySchoolId(schoolId: string): Promise<ApiActionResponseModelArray<BookingType>> {
    try {
        const result = await db.query.booking.findMany({
            where: eq(booking.schoolId, schoolId),
            with: bookingWithRelations
        });
        
        const bookings: BookingModel[] = result.map(bookingData => createBookingModel(bookingData));
        
        return bookings;
    } catch (error) {
        console.error("Error fetching bookings by school ID:", error);
        return { error: "Failed to fetch bookings" };
    }
}

export async function getBookingsByPackageId(packageId: string): Promise<ApiActionResponseModelArray<BookingType>> {
    try {
        const result = await db.query.booking.findMany({
            where: eq(booking.packageId, packageId),
            with: bookingWithRelations
        });
        
        const bookings: BookingModel[] = result.map(bookingData => createBookingModel(bookingData));
        
        return bookings;
    } catch (error) {
        console.error("Error fetching bookings by package ID:", error);
        return { error: "Failed to fetch bookings" };
    }
}

// UPDATE
export async function updateBooking(id: string, bookingSchema: Partial<BookingForm>) {
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
export async function deleteBooking(id: string) {
    try {
        await db.delete(booking).where(eq(booking.id, id));
        revalidatePath("/bookings");
        return { success: true };
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { success: false, error: "Failed to delete booking" };
    }
}