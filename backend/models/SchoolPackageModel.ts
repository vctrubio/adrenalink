import type { SchoolPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";
import { ENTITY_DATA } from "@/config/entities";

export type SchoolPackageModel = AbstractModel<SchoolPackageType> & {
    stats?: DataboardStats;
};

export function createSchoolPackageModel(schoolPackageData: any): Omit<SchoolPackageModel, "stats"> {
    const { school, studentPackages, ...pgTableSchema } = schoolPackageData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "schoolPackage")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            school,
            studentPackages,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: SchoolPackageModel =", model);
    }

    return model;
}
