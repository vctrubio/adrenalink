import { config } from "dotenv";
import { db } from "../db";
import { students } from "../schema";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function dropTable(tableName: string, description: string) {
  try {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
    console.log(`✅ ${description} dropped`);
  } catch (error) {
    console.log(`⚠️  ${description} not found (skipping)`);
  }
}

async function dropSchema(schemaName: string, description: string) {
  try {
    await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`));
    console.log(`✅ ${description} dropped`);
  } catch (error) {
    console.log(`⚠️  ${description} not found (skipping)`);
  }
}

async function clearDatabase() {
  console.log("🗑️  Clearing database...");
  
  try {
    console.log("🔥 Dropping all tables and schemas...");
    
    await dropTable("students", "Students table");
    await dropTable("__drizzle_migrations", "Migration table");
    await dropSchema("drizzle", "Drizzle schema");
    
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