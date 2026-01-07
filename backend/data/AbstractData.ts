export interface AbstractData<S, U, R> {
    schema: S;
    updateForm: U;
    relations: R;
}