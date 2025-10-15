import type { School, SchoolStudent } from "@/drizzle/schema";
import { AbstractModel } from "./StudentModel";

export class SchoolModel extends AbstractModel<School> {
    manyToMany?: {
        students?: SchoolStudent[];
    };
    lambda?: {
        studentCount?: number;
    };

    constructor(schema: School) {
        super("school", schema);
    }
}