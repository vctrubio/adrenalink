import type { EquipmentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type EquipmentStats = {
    teacherHours: Record<string, number>;
    eventsCount: number;
    totalDurationMinutes: number;
    rentalsCount: number;
    moneyIn: number;
    moneyOut: number;
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
