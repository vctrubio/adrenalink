import type { Student, SchoolStudent } from "@/drizzle/schema";

export type SerializedAbstractModel<T> = {
    tableName: string;
    schema: T;
    manyToMany?: Record<string, any[]>;
    lambda?: Record<string, any>;
};

export abstract class AbstractModel<T> {
    tableName: string;
    schema: T;
    manyToMany?: Record<string, any[]>;
    lambda?: Record<string, any>;

    constructor(tableName: string, schema: T) {
        this.tableName = tableName;
        this.schema = schema;
    }

    serialize(): SerializedAbstractModel<T> {
        return {
            tableName: this.tableName,
            schema: this.schema,
            manyToMany: this.manyToMany,
            lambda: this.lambda
        };
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