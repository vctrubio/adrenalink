import { config } from "dotenv";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { rmSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { TABLES_TO_CLEAR, ENUMS_TO_CLEAR, dropTable, dropEnum } from "./clear";

config({ path: ".env.local" });

async function checkDatabaseTables() {
    try {
        const result = await db.execute(sql`SELECT 1 FROM students LIMIT 1`);
        return true;
    } catch (error) {
        return false;
    }
}

function clearMigrationFiles() {
    const migrationsDir = join(process.cwd(), "drizzle", "migrations");
    const metaDir = join(migrationsDir, "meta");

    let deletedCount = 0;

    try {
        // Remove entire meta directory
        try {
            rmSync(metaDir, { recursive: true, force: true });
            deletedCount++;
            console.log("🗑️  Deleted meta directory");
        } catch (error) {
            console.log("⚠️  No meta directory found, skipping...");
        }

        // Clear migration SQL files (but keep the directories)
        try {
            const migrationFiles = readdirSync(migrationsDir);
            migrationFiles.forEach((file) => {
                const filePath = join(migrationsDir, file);
                if (statSync(filePath).isFile() && file.endsWith(".sql")) {
                    rmSync(filePath);
                    deletedCount++;
                    console.log(`🗑️  Deleted migration file: ${file}`);
                }
            });
        } catch (error) {
            console.log("⚠️  No migration files found, skipping...");
        }
    } catch (error) {
        console.log("⚠️  Migration directory not found, skipping...");
    }

    return deletedCount;
}

async function clearMeta() {
    console.log("🗑️  Starting comprehensive clear...");

    // Check if database has tables
    const hasTables = await checkDatabaseTables();

    if (hasTables) {
        console.log("📊 Database tables found, clearing database first...");

        try {
            // Drop tables
            for (const table of TABLES_TO_CLEAR) {
                await dropTable(table);
            }

            // Drop migration table
            await dropTable("__drizzle_migrations");

            // Drop enums
            for (const enumType of ENUMS_TO_CLEAR) {
                await dropEnum(enumType);
            }

            // Drop drizzle schema
            try {
                await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
                console.log("✅ Drizzle schema dropped");
            } catch (error) {
                console.log("⚠️  No drizzle schema found, skipping...");
            }

            console.log("✅ Database cleared");
        } catch (error) {
            console.log("⚠️  Error during database clear");
        }
    } else {
        console.log("⏭️  No data found in Supabase, skipping database clear...");
    }

    console.log("🧹 Clearing migration files...");
    const deletedCount = clearMigrationFiles();

    console.log("🎉 Clear-meta completed!");
    console.log(`📁 Files deleted: ${deletedCount}`);
    console.log("💡 Run 'bun run db:workflow' to recreate everything fresh");
}

clearMeta()
    .catch((error) => {
        console.error("❌ Error during clear-meta:", error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
