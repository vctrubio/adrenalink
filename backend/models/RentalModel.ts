import type { RentalType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type RentalModel = AbstractModel<RentalType> & {
    stats?: DataboardStats;
    popoverType?: string;
};

export function createRentalModel(rentalData: any): RentalModel {
    const { student, equipment, ...pgTableSchema } = rentalData;

    const model: RentalModel = {
        schema: pgTableSchema,
        relations: {
            student,
            equipment,
        },
        popoverType: "rental_details",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: RentalModel =", model);
    }

    return model;
}
