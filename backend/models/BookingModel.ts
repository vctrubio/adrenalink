import type { BookingType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import { ENTITY_DATA } from "@/config/entities";

export type BookingModel = AbstractModel<BookingType>;

export function createBookingModel(bookingData: any): BookingModel {
    const { school, schoolPackage, studentPackage, bookingStudents, lessons, ...pgTableSchema } = bookingData;

    const entityConfig = ENTITY_DATA.find(e => e.id === "booking")!;
    const { icon, ...serializableEntityConfig } = entityConfig;

    const model = {
        entityConfig: serializableEntityConfig,
        schema: pgTableSchema,
        relations: {
            school,
            schoolPackage,
            studentPackage,
            bookingStudents,
            lessons,
        },
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: BookingModel =", model);
    }

    return model;
}