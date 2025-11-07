import type { StudentModel, TeacherModel } from "@/backend/models";

export const getStudentDataboardCountStatus = (students: StudentModel[]): string => {
    return `${students.length}`;
};

export const getTeacherDataboardCountStatus = (teachers: TeacherModel[]): string => {
    return `${teachers.length}`;
};
