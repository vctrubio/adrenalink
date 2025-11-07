import type { StudentPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";
import { ENTITY_DATA } from "@/config/entities";

export type StudentPackageModel = AbstractModel<StudentPackageType> & {
    stats?: DataboardStats;
};

export function createStudentPackageModel(studentPackageData: any): Omit<StudentPackageModel, "stats"> {
    const { schoolPackage, studentPackageStudents, bookings, ...pgTableSchema } = studentPackageData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "studentPackage")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            schoolPackage,
            studentPackageStudents,
            bookings,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: StudentPackageModel =", model);
    }

    return model;
}