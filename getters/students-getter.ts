import type { StudentType } from "@/drizzle/schema";
import type { StudentModel } from "@/backend/models";

//this will be first_name + last_name later?
export function getStudentName(student: StudentType): string {
    return student.name;
}

export function getStudentSchoolCount(student: StudentModel): number {
    return student.relations?.schoolStudents?.length || 0;
}
