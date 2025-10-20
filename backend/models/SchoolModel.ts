import type { SchoolType, SchoolForm } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type SchoolModel = AbstractModel<SchoolType, SchoolForm>;

export function createSchoolModel(schoolData: any): SchoolModel {
    const { schoolStudents, schoolPackages, bookings, ...pgTableSchema } = schoolData;
    
    const entityConfig = ENTITY_DATA.find(e => e.id === "School")!;
    const { icon, ...serializableEntityConfig } = entityConfig;
    
    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        form: {} as SchoolForm,
        relations: {
            schoolStudents,
            schoolPackages,
            bookings,
        },
    };
    
    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: SchoolModel =", model);
    }
    
    return model;
}