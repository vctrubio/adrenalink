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
    isCleanupRegistered: boolean | undefined;
};

// Determine which DATABASE_URL to use:
const isProduction = process.env.NODE_ENV === "production";
const directUrl = process.env.DATABASE_DIRECT_URL;
const pooledUrl = process.env.DATABASE_URL;

// Preference: 
// 1. If DATABASE_URL (pooled) is available, use it (most reliable for dev/prod)
// 2. If not, fallback to DATABASE_DIRECT_URL
const dbUrl = pooledUrl || directUrl;

if (!dbUrl) {
    throw new Error("Neither DATABASE_URL nor DATABASE_DIRECT_URL is defined");
}

const isPooled = dbUrl.includes(":6543");

if (!globalForDb.conn) {
    console.log(`🔍 [DEBUG_DB] 🚀 INITIALIZING NEW CONNECTION`);
    console.log(`📡 [DB] Connecting in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔗 [DB] Target: ${dbUrl.split("@")[1]?.split(":")[0] || "unknown"}`);
    console.log(`🔌 [DB] Type: ${isPooled ? "POOLED (Port 6543)" : "DIRECT (Port 5432)"}`);
} else {
    console.log(`🔍 [DEBUG_DB] ♻️  REUSING EXISTING CONNECTION (Singleton)`);
}

// Singleton pattern to prevent connection leaks during HMR in development
const sql =
    globalForDb.conn ??
    postgres(dbUrl, {
        max: isProduction ? 10 : 20, // Keep dev higher for HMR, production lower for pooling limits
        idle_timeout: 30,
        connect_timeout: 5, // Fast failure for better UX (was 10)
        prepare: false,
        backoff: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
        onnotice: () => {}, // Quiet notices
    });

if (process.env.NODE_ENV !== "production") {
    globalForDb.conn = sql;
}

export const db = drizzle(sql, { schema: fullSchema });

// Graceful shutdown
if (typeof global !== "undefined" && !globalForDb.isCleanupRegistered) {
    console.log(`🔍 [DEBUG_DB] 🛠️  REGISTERING CLEANUP HANDLERS (SIGTERM/SIGINT)`);
    const cleanup = async () => {
        console.log("Closing database connections...");
        await sql.end();
    };
    process.once("SIGTERM", cleanup);
    process.once("SIGINT", cleanup);
    globalForDb.isCleanupRegistered = true;
} else if (typeof global !== "undefined") {
    console.log(`🔍 [DEBUG_DB] ⏭️  CLEANUP HANDLERS ALREADY REGISTERED - SKIPPING`);
}
