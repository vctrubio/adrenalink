import type { StudentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type StudentUpdateForm = StudentType & {
    description?: string | null;
    active?: boolean;
    rental?: boolean;
};

export type StudentModel = AbstractModel<StudentUpdateForm> & {
    schema: StudentType;
    stats?: DataboardStats;
    popoverType?: "student_package";
};

export function createStudentModel(studentData: any, schoolId?: string): StudentModel {
    const { schoolStudents, studentPackageStudents, bookingStudents, bookingPayments, ...pgTableSchema } = studentData;

    // Get the school-specific data from the matching schoolStudent record
    const schoolStudent = schoolId ? schoolStudents?.find((ss: any) => ss.schoolId === schoolId) : schoolStudents?.[0];
    const description = schoolStudent?.description || null;
    const active = schoolStudent?.active ?? true;
    const rental = schoolStudent?.rental ?? false;

    const model: StudentModel = {
        schema: pgTableSchema,
        updateForm: {
            ...pgTableSchema,
            description,
            active,
            rental,
        },
        relations: {
            schoolStudents,
            studentPackageStudents,
            bookingStudents,
            bookingPayments,
        },
        popoverType: "student_package",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: StudentModel =", model);
    }

    return model;
}
