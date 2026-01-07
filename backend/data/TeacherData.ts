import { Teacher } from "@/supabase/db/types";
import { AbstractData } from "./AbstractData";

export interface TeacherRelations {
    commissions: any[];    // teacher_commission records
    lessons: any[];        // lesson records with nested booking, events, payments
    equipments: any[];     // equipment assigned to teacher
}

export interface TeacherUpdateForm extends Teacher {
    // Standard fields plus any school-specific context if needed
}

export interface TeacherData extends AbstractData<Teacher, TeacherUpdateForm, TeacherRelations> {
    // Plain object interface
}
