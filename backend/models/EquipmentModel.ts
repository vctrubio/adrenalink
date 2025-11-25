import type { EquipmentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type EquipmentStats = DataboardStats & {
    teacherHours: Record<string, number>;
};

export type EquipmentUpdateForm = EquipmentType;

export type EquipmentModel = AbstractModel<EquipmentUpdateForm> & {
    schema: EquipmentType;
    stats?: EquipmentStats;
    popoverType?: "equipment_repair";
};

export function createEquipmentModel(equipmentData: any): EquipmentModel {
    const { teacherEquipments, equipmentRepairs, ...pgTableSchema } = equipmentData;

    const model: EquipmentModel = {
        schema: pgTableSchema,
        updateForm: pgTableSchema,
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
