import type { LessonType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type LessonModel = AbstractModel<LessonType>;

export function createLessonModel(lessonData: any): LessonModel {
    const { teacher, commission, events, payments, feedback, ...pgTableSchema } = lessonData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "lesson")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            teacher,
            commission,
            events,
            payments,
            feedback,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: LessonModel =", model);
    }

    return model;
}
