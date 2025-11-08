export type AbstractModel<T> = {
    schema: T;
    relations?: Record<string, any>;
    stats?: Record<string, any>;
    popoverType?: string;
};