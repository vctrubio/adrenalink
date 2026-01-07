import { Booking, SchoolPackage, Student, Lesson, Event } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface BookingUpdateForm extends Booking {}

export interface BookingRelations {
    school_package: SchoolPackage;
    students: Student[];
    lessons: (Lesson & {
        teacher: {
            id: string;
            username: string;
            first_name: string;
            last_name: string;
        };
        events: Event[];
    })[];
    student_booking_payment: {
        id: string;
        amount: number;
        created_at: string;
        student_id: string;
        student_name: string;
    }[];
}

export interface BookingData extends AbstractData {
    schema: Booking;
    updateForm: BookingUpdateForm;
    relations: BookingRelations;
}