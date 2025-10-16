import type { AbstractModel } from "@/backend/models";

export type ApiActionResponseModel<T> = AbstractModel<T> | { error: string };
export type ApiActionResponseModelArray<T> = AbstractModel<T>[] | { error: string };