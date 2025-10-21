export type ApiActionResponseModel<T> = { success: true; data: T } | { success: false; error: string };
