import type { StudentModel } from "@/backend/models";

export const getStudentDataboardCountStatus = (students: StudentModel[]): string => {
    return `${students.length}`;
};
