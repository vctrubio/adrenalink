import { Student } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface StudentRelations {
    student_package: any[]; // student_package records
    bookings: any[];       // booking records with nested relations
    school_students: any[]; // school_students context
    student_booking_payment: any[]; // student_booking_payment
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
