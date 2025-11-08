import type { ReferralType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type ReferralModel = AbstractModel<ReferralType> & {
    stats?: DataboardStats;
    popoverType?: string;
};

export function createReferralModel(referralData: any): ReferralModel {
    const { school, studentPackages, ...pgTableSchema } = referralData;

    const model: ReferralModel = {
        schema: pgTableSchema,
        relations: {
            school,
            studentPackages,
        },
        popoverType: "referral_details",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: ReferralModel =", model);
    }

    return model;
}
