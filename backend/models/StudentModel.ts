import type { StudentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";
import { ENTITY_DATA } from "@/config/entities";

export type StudentModel = AbstractModel<StudentType> & {
    stats?: DataboardStats;
};

export function createStudentModel(studentData: any): StudentModel {
    const { schoolStudents, studentPackageStudents, bookingStudents, bookingPayments, ...pgTableSchema } = studentData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "student")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            schoolStudents,
            studentPackageStudents,
            bookingStudents,
            bookingPayments,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: StudentModel =", model);
    }

    return model;
}