export interface AbstractModel<T> {
    updateForm: T;
    relations?: Record<string, any>;
    stats?: Record<string, any>;
    popoverType?: string;
}