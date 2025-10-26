"use server";

import { db } from "@/drizzle/db";
import {
    school,
    student,
    schoolPackage,
    booking
} from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

const ENTITY_TABLE_MAP: Record<string, PgTable<any> | null> = {
    "School": school,
    "Student": student,
    "School Package": schoolPackage,
    "Booking": booking,
    "Teacher": null,
    "Commission": null,
    "Equipment": null,
    "User Wallet": null,
    "Lesson": null,
    "Event": null,
    "Payment": null
};

export async function getEntityCount(entityId: string): Promise<number> {
    try {
        const table = ENTITY_TABLE_MAP[entityId];

        if (!table) {
            return 0;
        }

        const result = await db.select({ count: sql<number>`count(*)` }).from(table);
        return Number(result[0].count);
    } catch (error) {
        console.error(`Error fetching count for entity ${entityId}:`, error);
        return 0;
    }
}
