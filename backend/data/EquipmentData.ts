import { Equipment, Event, Teacher, Rental, Student, SchoolPackage } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface EquipmentUpdateForm extends Equipment {}

export interface EquipmentRelations {
    /** Events where this equipment was used */
    events: (Event & {
        lesson: {
            booking: {
                id: string;
                leader_student_name: string;
                school_package: SchoolPackage;
            }
        }
    })[];
    /** Repairs done on this equipment */
    repairs: {
        id: string;
        description: string | null;
        created_at: string;
    }[];
    /** Teachers associated with this equipment */
    teachers: Teacher[];
    /** Rentals involving this equipment */
    rentals: (Rental & {
        students: Student[];
    })[];
}

export interface EquipmentData extends AbstractData {
    schema: Equipment;
    updateForm: EquipmentUpdateForm;
    relations: EquipmentRelations;
}
