import type { EquipmentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";
import { ENTITY_DATA } from "@/config/entities";

export type EquipmentStats = DataboardStats & {
    teacherHours: Record<string, number>;
};

export type EquipmentModel = AbstractModel<EquipmentType> & {
    stats?: EquipmentStats;
};

export function createEquipmentModel(equipmentData: any): Omit<EquipmentModel, "stats"> {
    const { teacherEquipments, equipmentRepairs, ...pgTableSchema } = equipmentData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "equipment")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            teacherEquipments,
            equipmentRepairs,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: EquipmentModel =", model);
    }

    return model;
}
