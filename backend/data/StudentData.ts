import { Student } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface StudentRelations {
    studentPackage: any[]; // student_package records
    bookings: any[];       // booking records with nested relations
    schoolStudents: any[]; // school_students context
    bookingPayments: any[]; // student_booking_payment
}

export interface StudentUpdateForm extends Student {
    description?: string | null;
    active?: boolean;
    rental?: boolean;
    schoolId?: string;
}

export interface StudentData extends AbstractData<Student, StudentUpdateForm, StudentRelations> {
    // Plain object interface
}