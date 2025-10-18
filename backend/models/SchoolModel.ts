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
    };

    constructor(schema: SchoolType) {
        super("school", schema);
    }
}