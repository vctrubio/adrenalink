import type { StudentPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type StudentPackageModel = AbstractModel<StudentPackageType>;

export function createStudentPackageModel(studentPackageData: any): StudentPackageModel {
    const { student, schoolPackage, ...pgTableSchema } = studentPackageData;
    
    const entityConfig = ENTITY_DATA.find(e => e.id === "Student Package")!;
    const { icon, ...serializableEntityConfig } = entityConfig;
    
    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            student,
            schoolPackage,
        },
    };
    
    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: StudentPackageModel =", model);
    }
    
    return model;
}