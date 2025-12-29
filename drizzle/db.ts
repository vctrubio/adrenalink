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

// Singleton pattern to prevent connection leaks during HMR in development
const sql =
    globalForDb.conn ??
    postgres(process.env.DATABASE_URL, {
        max: 10, // Increased from 1 for better concurrency
        idle_timeout: 20,
        connect_timeout: 30,
        prepare: false, // Essential for Supabase Transaction pooler
        backoff: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
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
