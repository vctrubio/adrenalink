import type { SchoolPackageType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class SchoolPackageModel extends AbstractModel<SchoolPackageType> {
    constructor(schema: SchoolPackageType) {
        super("school_package", schema);
    }
}
