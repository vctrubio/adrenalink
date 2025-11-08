import type { StudentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type StudentModel = AbstractModel<StudentType> & {
    stats?: DataboardStats;
    popoverType?: "student_package";
};

export function createStudentModel(studentData: any): StudentModel {
    const { schoolStudents, studentPackageStudents, bookingStudents, bookingPayments, ...pgTableSchema } = studentData;

    const model: StudentModel = {
        schema: pgTableSchema,
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