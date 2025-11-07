import type { RentalType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type RentalModel = AbstractModel<RentalType>;

export function createRentalModel(rentalData: any): RentalModel {
    const { student, equipment, ...pgTableSchema } = rentalData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "rental");
    if (!entityConfig) {
        throw new Error("Rental entity config not found in ENTITY_DATA");
    }

    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            student,
            equipment,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: RentalModel =", model);
    }

    return model;
}
