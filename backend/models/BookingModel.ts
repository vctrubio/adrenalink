import type { BookingType, SchoolType, SchoolPackageType, StudentPackageType, BookingStudentType, StudentType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

type BookingStudentWithStudent = BookingStudentType & {
    student: StudentType;
};

export class BookingModel extends AbstractModel<BookingType> {
    relations?: {
        school?: SchoolType;
        schoolPackage?: SchoolPackageType;
        studentPackage?: StudentPackageType;
        bookingStudents?: BookingStudentWithStudent[];
    };

    constructor(schema: BookingType) {
        super("booking", schema);
    }
}