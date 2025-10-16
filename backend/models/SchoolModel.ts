import type { SchoolType, SchoolStudentType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class SchoolModel extends AbstractModel<SchoolType> {
    relations?: {
        schoolStudents?: SchoolStudentType[];
    };
    lambda?: {
        studentCount?: number;
    };

    constructor(schema: SchoolType) {
        super("school", schema);
    }
}