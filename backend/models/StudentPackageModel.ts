import type { StudentPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type StudentPackageUpdateForm = StudentPackageType;

export type StudentPackageModel = AbstractModel<StudentPackageUpdateForm> & {
    schema: StudentPackageType;
    stats?: DataboardStats;
    popoverType?: string;
};

export function createStudentPackageModel(studentPackageData: any): StudentPackageModel {
    const { schoolPackage, studentPackageStudents, bookings, ...pgTableSchema } = studentPackageData;

    const model: StudentPackageModel = {
        schema: pgTableSchema,
        updateForm: pgTableSchema,
        relations: {
            schoolPackage,
            studentPackageStudents,
            bookings,
        },
        popoverType: "student_package_details",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: StudentPackageModel =", model);
    }

    return model;
}
