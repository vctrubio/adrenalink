"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { booking, type BookingForm, type BookingType } from "@/drizzle/schema";
import { BookingModel } from "@/backend/models";
import type { ApiActionResponseModel, ApiActionResponseModelArray } from "@/types/actions";

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
        const result = await db.query.booking.findMany({
            with: {
                schoolPackage: true,
                school: true,
                studentPackage: true,
                bookingStudents: {
                    with: {
                        student: true
                    }
                }
            }
        });
        
        const bookings: BookingModel[] = result.map(bookingData => {
            const { schoolPackage, school, studentPackage, bookingStudents, ...pureSchema } = bookingData;
            const bookingModel = new BookingModel(pureSchema);
            
            // Map relations from query result
            bookingModel.relations = {
                schoolPackage: schoolPackage,
                school: school,
                studentPackage: studentPackage,
                bookingStudents: bookingStudents
            };
            
            return bookingModel;
        });
        
        return bookings;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return { error: "Failed to fetch bookings" };
    }
}

export async function getBookingById(id: string): Promise<ApiActionResponseModel<BookingType>> {
    try {
        const result = await db.query.booking.findFirst({
            where: eq(booking.id, id),
            with: {
                schoolPackage: true,
                school: true,
                studentPackage: true,
                bookingStudents: {
                    with: {
                        student: true
                    }
                }
            }
        });
        
        if (result) {
            const { schoolPackage, school, studentPackage, bookingStudents, ...pureSchema } = result;
            const bookingModel = new BookingModel(pureSchema);
            
            // Map relations from query result
            bookingModel.relations = {
                schoolPackage: schoolPackage,
                school: school,
                studentPackage: studentPackage,
                bookingStudents: bookingStudents
            };
            
            return bookingModel;
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
            with: {
                schoolPackage: true,
                school: true,
                studentPackage: true,
                bookingStudents: {
                    with: {
                        student: true
                    }
                }
            }
        });
        
        const bookings: BookingModel[] = result.map(bookingData => {
            const { schoolPackage, school, studentPackage, bookingStudents, ...pureSchema } = bookingData;
            const bookingModel = new BookingModel(pureSchema);
            
            // Map relations from query result
            bookingModel.relations = {
                schoolPackage: schoolPackage,
                school: school,
                studentPackage: studentPackage,
                bookingStudents: bookingStudents
            };
            
            return bookingModel;
        });
        
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
            with: {
                schoolPackage: true,
                school: true,
                studentPackage: true,
                bookingStudents: {
                    with: {
                        student: true
                    }
                }
            }
        });
        
        const bookings: BookingModel[] = result.map(bookingData => {
            const { schoolPackage, school, studentPackage, bookingStudents, ...pureSchema } = bookingData;
            const bookingModel = new BookingModel(pureSchema);
            
            // Map relations from query result
            bookingModel.relations = {
                schoolPackage: schoolPackage,
                school: school,
                studentPackage: studentPackage,
                bookingStudents: bookingStudents
            };
            
            return bookingModel;
        });
        
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