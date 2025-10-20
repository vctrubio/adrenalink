import type { StudentType } from "@/drizzle/schema";

//this will be first_name + last_name later?
export function getStudentName(student: StudentType): string {
    return student.name;
}
