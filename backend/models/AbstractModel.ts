export type SerializedAbstractModel<T> = {
    tableName: string;
    schema: T;
    relations?: Record<string, any>;
    lambda?: Record<string, any>;
};

export abstract class AbstractModel<T> {
    tableName: string;
    schema: T;
    relations?: Record<string, any>;
    lambda?: Record<string, any>;

    constructor(tableName: string, schema: T) {
        this.tableName = tableName;
        this.schema = schema;
    }

    serialize(): SerializedAbstractModel<T> {
        return {
            tableName: this.tableName,
            schema: this.schema,
            relations: this.relations,
            lambda: this.lambda
        };
    }
}