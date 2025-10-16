import type { StudentType, SchoolStudentType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class StudentModel extends AbstractModel<StudentType> {
    relations?: {
        schoolStudents?: SchoolStudentType[];
    };
    lambda?: {
        schoolCount?: number;
    };

    constructor(schema: StudentType) {
        super("student", schema);
    }
}