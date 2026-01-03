import type { BookingType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type BookingUpdateForm = BookingType;

export type BookingModel = AbstractModel<BookingUpdateForm> & {
    schema: BookingType;
    stats?: DataboardStats;
    popoverType?: "booking_completion";
    bookingStudentFirstNames?: string;
    bookingStudentLastNames?: string;
    bookingStudentPassports?: string;
    bookingStudentPhones?: string;
};

export function createBookingModel(bookingData: any): BookingModel {
    const { school, schoolPackage, studentPackage, bookingStudents, lessons, studentBookingPayments, ...pgTableSchema } = bookingData;

    // Aggregate booking student data for search
    const studentFirstNames =
        bookingStudents
            ?.map((bs: any) => bs.student?.firstName || "")
            .filter(Boolean)
            .join(" ") || "";
    const studentLastNames =
        bookingStudents
            ?.map((bs: any) => bs.student?.lastName || "")
            .filter(Boolean)
            .join(" ") || "";
    const studentPassports =
        bookingStudents
            ?.map((bs: any) => bs.student?.passport || "")
            .filter(Boolean)
            .join(" ") || "";
    const studentPhones =
        bookingStudents
            ?.map((bs: any) => bs.student?.phone || "")
            .filter(Boolean)
            .join(" ") || "";

    const model: BookingModel = {
        schema: pgTableSchema,
        relations: {
            school,
            schoolPackage,
            studentPackage,
            bookingStudents,
            lessons,
            studentBookingPayments,
        },
        bookingStudentFirstNames: studentFirstNames,
        bookingStudentLastNames: studentLastNames,
        bookingStudentPassports: studentPassports,
        bookingStudentPhones: studentPhones,
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: BookingModel =", model);
    }

    return model;
}
