import type { EventType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type EventModel = AbstractModel<EventType>;

export function createEventModel(eventData: any): EventModel {
    const { lesson, equipmentEvents, ...pgTableSchema } = eventData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "event")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            lesson,
            equipmentEvents,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: EventModel =", model);
    }

    return model;
}
