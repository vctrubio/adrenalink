import type { SchoolPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type SchoolPackageModel = AbstractModel<SchoolPackageType> & {
    stats?: DataboardStats;
    popoverType?: string;
};

export function createSchoolPackageModel(schoolPackageData: any): SchoolPackageModel {
    const { school, studentPackages, ...pgTableSchema } = schoolPackageData;

    const model: SchoolPackageModel = {
        schema: pgTableSchema,
        relations: {
            school,
            studentPackages,
        },
        popoverType: "school_package_details",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: SchoolPackageModel =", model);
    }

    return model;
}
