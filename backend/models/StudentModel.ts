import type { StudentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type StudentModel = AbstractModel<StudentType>;

export function createStudentModel(studentData: any): StudentModel {
    const { schoolStudents, studentPackages, bookingStudents, ...pgTableSchema } = studentData;
    
    const entityConfig = ENTITY_DATA.find(e => e.id === "student")!;
    const { icon, ...serializableEntityConfig } = entityConfig;
    
    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            schoolStudents,
            studentPackages,
            bookingStudents,
        },
    };
    
    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: StudentModel =", model);
    }
    
    return model;
}