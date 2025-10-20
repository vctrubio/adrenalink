import type { EntityConfig } from "@/config/entities";

export type AbstractModel<T> = {
    entityConfig: Omit<EntityConfig, "icon">;
    schema: T;
    relations?: Record<string, any>;
};