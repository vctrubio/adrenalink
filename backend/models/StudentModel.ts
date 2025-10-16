import type { Student, SchoolStudent } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class StudentModel extends AbstractModel<Student> {
    relations?: {
        schoolStudents?: SchoolStudent[];
    };
    lambda?: {
        schoolCount?: number;
    };

    constructor(schema: Student) {
        super("student", schema);
    }
}