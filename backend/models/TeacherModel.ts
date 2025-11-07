import type { TeacherType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";
import { ENTITY_DATA } from "@/config/entities";

export type TeacherModel = AbstractModel<TeacherType> & {
    stats?: DataboardStats;
};

export function createTeacherModel(teacherData: any): TeacherModel {
    const { school, commissions, lessons, equipments, ...pgTableSchema } = teacherData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "teacher")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            school,
            commissions,
            lessons,
            equipments,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: TeacherModel =", model);
    }

    return model;
}
