import type { Student, SchoolStudent } from "@/drizzle/schema";

export abstract class AbstractModel<T> {
    tableName: string;
    schema: T;
    manyToMany?: Record<string, any[]>;
    lambda?: Record<string, any>;

    constructor(tableName: string, schema: T) {
        this.tableName = tableName;
        this.schema = schema;
    }
}

export class StudentModel extends AbstractModel<Student> {
    manyToMany?: {
        schools?: SchoolStudent[];
    };
    lambda?: {
        schoolCount?: number;
    };

    constructor(schema: Student) {
        super("student", schema);
    }
}