import type { SchoolPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type SchoolPackageModel = AbstractModel<SchoolPackageType>;

export function createSchoolPackageModel(schoolPackageData: any): SchoolPackageModel {
    const { school, studentPackages, bookings, ...pgTableSchema } = schoolPackageData;
    
    const entityConfig = ENTITY_DATA.find(e => e.id === "schoolPackage")!;
    const { icon, ...serializableEntityConfig } = entityConfig;
    
    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            school,
            studentPackages,
            bookings,
        },
    };
    
    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: SchoolPackageModel =", model);
    }
    
    return model;
}
