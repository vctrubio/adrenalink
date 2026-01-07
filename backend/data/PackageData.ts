import { SchoolPackage, StudentPackage, Booking, Referral, Student, Lesson, Event } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface PackageUpdateForm extends SchoolPackage {}

export interface PackageRelations {
    /** Requests made for this package */
    requests: (StudentPackage & {
        referral?: Referral;
        bookings: any[]; // Kept for interface compatibility but populated as empty from server
    })[];
    /** Resulting bookings for this package */
    bookings: (Booking & {
        students: Student[];
        lessons: (Lesson & {
            teacher: {
                id: string;
                username: string;
                first_name: string;
                last_name: string;
            };
            event: Event[];
        })[];
    })[];
}

export interface PackageData extends AbstractData {
    schema: SchoolPackage;
    updateForm: PackageUpdateForm;
    relations: PackageRelations;
}