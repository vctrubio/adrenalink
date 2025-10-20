import type { SchoolType, SchoolStudentType, SchoolPackageType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class SchoolModel extends AbstractModel<SchoolType> {
    relations?: {
        schoolStudents?: SchoolStudentType[];
        schoolPackages?: SchoolPackageType[];
    };
    lambda?: {
        studentCount?: number;
        packageCount?: number;
        totalStudentRequests?: number;
        timezone?: string;
        city?: string;
        equipmentList?: string[];
    };

    constructor(schema: SchoolType) {
        super("school", schema);
    }
}