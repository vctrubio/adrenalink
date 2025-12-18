import { config } from "dotenv";
import { db } from "../db";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

// Tables and enums to clear
export const TABLES_TO_CLEAR = [
    "student",
    "school",
    "school_students",
    "school_package",
    "school_subscription",
    "subscription_payment",
    "student_package",
    "student_package_student",
    "booking",
    "booking_student",
    "student_booking_payment",
    "equipment",
    "referral",
    "teacher",
    "teacher_commission",
    "teacher_equipment",
    "lesson",
    "teacher_lesson_payment",
    "event",
    "equipment_event",
    "equipment_repair",
    "student_lesson_feedback",
    "rental",
];
export const ENUMS_TO_CLEAR = [
    "equipment_category",
    "student_package_status",
    "school_status",
    "commission_type",
    "equipment_status",
    "lesson_status",
    "event_status",
    "rental_status",
    "package_type",
    "languages",
    "booking_status",
    "currency",
    "subscription_tier",
    "subscription_status",
];

export async function dropTable(tableName: string) {
    try {
        await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
        console.log(`✅ Table "${tableName}" dropped`);
    } catch (error) {
        console.log(`⚠️  No table "${tableName}" found, skipping...`);
    }
}

export async function dropEnum(enumName: string) {
    try {
        await db.execute(sql.raw(`DROP TYPE IF EXISTS "${enumName}" CASCADE`));
        console.log(`✅ Enum "${enumName}" dropped`);
    } catch (error) {
        console.log(`⚠️  No enum "${enumName}" found, skipping...`);
    }
}

async function clearDatabase() {
    console.log("🗑️  Clearing database...");

    try {
        console.log("🔥 Dropping tables...");
        for (const table of TABLES_TO_CLEAR) {
            await dropTable(table);
        }

        await dropTable("__drizzle_migrations");

        console.log("🔥 Dropping enums...");
        for (const enumType of ENUMS_TO_CLEAR) {
            await dropEnum(enumType);
        }

        try {
            await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
            console.log("✅ Drizzle schema dropped");
        } catch (error) {
            console.log("⚠️  No drizzle schema found, skipping...");
        }

        console.log("🎉 Database cleared successfully!");
        console.log("💡 Run 'bun run db:push' to recreate tables");
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

clearDatabase();
