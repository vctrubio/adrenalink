import type { BookingType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type BookingUpdateForm = BookingType;

export type BookingModel = AbstractModel<BookingUpdateForm> & {
    schema: BookingType;
    stats?: DataboardStats;
    popoverType?: "booking_completion";
};

export function createBookingModel(bookingData: any): BookingModel {
    const { school, schoolPackage, studentPackage, bookingStudents, lessons, studentBookingPayments, ...pgTableSchema } = bookingData;

    const model: BookingModel = {
        schema: pgTableSchema,
        updateForm: pgTableSchema,
        relations: {
            school,
            schoolPackage,
            studentPackage,
            bookingStudents,
            lessons,
            studentBookingPayments,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: BookingModel =", model);
    }

    return model;
}