import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";

const fullSchema = { ...schema, ...relations };

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// Determine which DATABASE_URL to use:
// - Development: Use Direct URL (best for complex queries + realtime)
// - Production: Use Pooled URL (aws-1-eu-west-1.pooler.supabase.com:6543)
// Note: Transaction pooler (port 6543) is slow for complex queries
//       Session pooler (port 5432 with ?pgbouncer=true) is better
//       Direct connection (db.*.supabase.co:5432) is best for everything
const dbUrl = process.env.NODE_ENV !== "production" && process.env.DATABASE_DIRECT_URL
    ? process.env.DATABASE_DIRECT_URL
    : process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("DATABASE_URL or DATABASE_DIRECT_URL is not defined");
}

console.log(`📡 Connecting to database in ${process.env.NODE_ENV} mode: ${dbUrl?.split("@")[1]?.split(":")[0] || "unknown"}`);

// Singleton pattern to prevent connection leaks during HMR in development
const sql =
    globalForDb.conn ??
    postgres(dbUrl, {
        max: 20, // Increased for better concurrency (was 10)
        idle_timeout: 60, // Increased for better connection reuse (was 20)
        connect_timeout: 10, // Decreased for faster feedback (was 30)
        prepare: false, // Disable prepared statements to reduce overhead
        backoff: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
        debug: process.env.DEBUG_DB_QUERIES === "true" ? console.log : undefined,
    });

if (process.env.NODE_ENV !== "production") {
    globalForDb.conn = sql;
}

export const db = drizzle(sql, { schema: fullSchema });

// Graceful shutdown
if (typeof global !== "undefined") {
    const cleanup = async () => {
        console.log("Closing database connections...");
        await sql.end();
    };
    process.once("SIGTERM", cleanup);
    process.once("SIGINT", cleanup);
}
