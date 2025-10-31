import type { TeacherCommissionType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type CommissionModel = AbstractModel<TeacherCommissionType>;

export function createCommissionModel(commissionData: any): CommissionModel {
    const { teacher, lessons, ...pgTableSchema } = commissionData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "commission")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            teacher,
            lessons,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: CommissionModel =", model);
    }

    return model;
}
