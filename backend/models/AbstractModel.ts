import type { EntityConfig } from "@/config/entities";

export type AbstractModel<T, F = any> = {
    entityConfig: Omit<EntityConfig, "icon">;
    schema: T;
    form: F;
    relations?: Record<string, any>;
};