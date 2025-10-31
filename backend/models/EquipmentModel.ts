import type { EquipmentType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type EquipmentModel = AbstractModel<EquipmentType>;

export function createEquipmentModel(equipmentData: any): EquipmentModel {
    const { school, teacherEquipments, equipmentEvents, ...pgTableSchema } = equipmentData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "equipment")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            school,
            teacherEquipments,
            equipmentEvents,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: EquipmentModel =", model);
    }

    return model;
}
