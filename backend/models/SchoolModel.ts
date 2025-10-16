import type { School, SchoolStudent } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class SchoolModel extends AbstractModel<School> {
    relations?: {
        students?: SchoolStudent[];
    };
    lambda?: {
        studentCount?: number;
    };

    constructor(schema: School) {
        super("school", schema);
    }
}