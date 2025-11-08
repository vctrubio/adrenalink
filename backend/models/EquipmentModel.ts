import type { EquipmentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type EquipmentStats = DataboardStats & {
    teacherHours: Record<string, number>;
};

export type EquipmentModel = AbstractModel<EquipmentType> & {
    stats?: EquipmentStats;
    popoverType?: "equipment_repair";
};

export function createEquipmentModel(equipmentData: any): EquipmentModel {
    const { teacherEquipments, equipmentRepairs, ...pgTableSchema } = equipmentData;

    const model: EquipmentModel = {
        schema: pgTableSchema,
        relations: {
            teacherEquipments,
            equipmentRepairs,
        },
        popoverType: "equipment_repair",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: EquipmentModel =", model);
    }

    return model;
}
