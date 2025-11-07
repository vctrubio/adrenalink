import type { ReferralType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";
import { ENTITY_DATA } from "@/config/entities";

export type ReferralModel = AbstractModel<ReferralType> & {
    stats?: DataboardStats;
};

export function createReferralModel(referralData: any): Omit<ReferralModel, "stats"> {
    const { school, studentPackages, ...pgTableSchema } = referralData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "referral");
    if (!entityConfig) {
        throw new Error("Referral entity config not found in ENTITY_DATA");
    }

    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            school,
            studentPackages,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: ReferralModel =", model);
    }

    return model;
}
