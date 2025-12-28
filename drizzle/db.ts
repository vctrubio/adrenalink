import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";

const fullSchema = { ...schema, ...relations };

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

// Singleton pattern to prevent connection exhaustion in development
// https://github.com/vercel/next.js/discussions/26427
declare global {
    var _pgClient: postgres.Sql | undefined;
    var _db: ReturnType<typeof drizzle> | undefined;
}

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

if (process.env.NODE_ENV === "production") {
    client = postgres(process.env.DATABASE_URL, {
        max: 10, // Maximum pool connections
        idle_timeout: 20,
        connect_timeout: 10,
    });
    db = drizzle(client, { schema: fullSchema });
} else {
    // In development, reuse the connection across hot reloads
    if (!global._pgClient) {
        global._pgClient = postgres(process.env.DATABASE_URL, {
            max: 1, // Limit connections in dev
            idle_timeout: 20,
            connect_timeout: 10,
        });
    }
    client = global._pgClient;
    
    if (!global._db) {
        global._db = drizzle(client, { schema: fullSchema });
    }
    db = global._db;
}

export { db };
