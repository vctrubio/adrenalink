import type { StudentPackageType, StudentType, SchoolPackageType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class StudentPackageModel extends AbstractModel<StudentPackageType> {
    relations?: {
        student?: StudentType;
        schoolPackage?: SchoolPackageType;
    };

    constructor(schema: StudentPackageType) {
        super("student_package", schema);
    }
}