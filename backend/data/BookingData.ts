import { Booking, SchoolPackage, Student, Lesson, Event } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface BookingUpdateForm extends Booking {}

export interface BookingRelations {
    schoolPackage: SchoolPackage;
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
    payments: {
        id: string;
        amount: number;
        createdAt: string;
        studentId: string;
        studentName: string;
    }[];
}

export interface BookingData extends AbstractData {
    schema: Booking;
    updateForm: BookingUpdateForm;
    relations: BookingRelations;
}
