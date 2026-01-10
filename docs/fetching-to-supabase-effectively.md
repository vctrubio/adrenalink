# Fetching to Supabase Effectively

## Current Situation

We are currently using `drizzle-orm` with the `postgres.js` driver in a Next.js environment (Server Actions).

- **Driver:** `postgres` (postgres.js)
- **Pattern:** Direct SQL execution (`db.execute(sql...)`) and Drizzle Query Builder (`db.query...`).
- **Risk:** Server Actions run in serverless/edge environments. Every invocation might spin up a new instance. If `postgres.js` creates a default connection pool (e.g., 10 connections) for _every_ instance, we will rapidly exhaust Supabase's `max_clients` limit (typically 100 for direct connections).

## Risks

1.  **Connection Exhaustion:** "FATAL: remaining connection slots are reserved for non-replication superuser roles".
2.  **Client Timeouts:** Queries hanging because they are waiting for a free connection slot.
3.  **Latency:** Overhead of establishing SSL connections on every cold start.

## Optimization Strategy

### 1. Use the Transaction Pooler (Supavisor)

Supabase provides a built-in connection pooler at port `6543`.

- **Action:** Ensure `DATABASE_URL` in `.env` points to `aws-0-region.pooler.supabase.com` (or similar) instead of `db.project.supabase.co`.
- **Mode:** Use "Transaction" mode for Serverless functions.

### 2. Drizzle Configuration for Poolers

Transaction poolers do not support Prepared Statements (which Drizzle tries to use by default).

- **Action:** Modify `drizzle/db.ts` to disable prepare.

```typescript
// drizzle/db.ts
export const db = drizzle(client, {
    schema: fullSchema,
    // essential for Supabase Transaction pooler
    // prepare: false
});
```

_(Note: `postgres.js` handles this differently than `node-postgres`. We need to verify if `postgres.js` tries to prepare statements named-ly. Usually simply using `client` is fine, but we must ensure we don't hold the connection open unnecessarily.)_

### 3. Connection Caching (Singleton)

In Next.js development (Hot Reload), we risk creating a new DB client on every file save.

- **Action:** Use a global singleton pattern for the database client.

```typescript
// drizzle/db.ts
const globalForDb = globalThis as unknown as { conn: postgres.Sql | undefined };
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL!);
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
```

### 4. Efficient Querying

- **Limit Selection:** Do not use `select *`. Explicitly select columns: `db.select({ id: table.id, name: table.name })`.
- **Pagination:** Always use `.limit()` and `.offset()` or cursor-based pagination.
- **Wizard SQL Actions:** The current implementation `actions/wizard-sql-action.ts` correctly uses `LIMIT 50` and specific column selection. This is good practice.

### 5. Supabase Client vs. Direct SQL

For simple CRUD, the Supabase JS Client (REST API) is connection-less and scales infinitely.

- **Consideration:** For high-traffic read endpoints (like the Navigation Wizard search), consider using `supabase-js` client instead of direct DB connection if connection limits become a bottleneck.

## Implementation Plan (Tomorrow)

1.  Verify `DATABASE_URL` is using the pooled connection string.
2.  Refactor `drizzle/db.ts` to use the Singleton pattern.
3.  Add error handling for connection timeouts in the UI (Graceful degradation).
4.  Review `wizard-sql-action.ts` to ensure it closes connections or relies on the global pool correctly.

### Database Pooling Guide for Production

## Current Setup Analysis

Your app uses `postgres-js` with Drizzle ORM, which provides built-in connection pooling. This is different from using `pg` with manual pool configuration.

## Pre-Production Checklist

### 1. Connection Pool Configuration

**Current Issue**: Your `drizzle/db.ts` uses default connection settings which may not be optimal for production.

**Recommended Configuration**:

```typescript
const client = postgres(process.env.DATABASE_URL, {
    max: 20, // Max connections (adjust based on your server capacity)
    idle_timeout: 20, // Seconds before closing idle connections
    max_lifetime: 60 * 30, // 30 minutes max connection lifetime
    prepare: false, // Disable for better Supabase compatibility
    transform: undefined, // Better performance
    connection: {
        application_name: "adrenalink-beta", // For monitoring
    },
});
```

### 2. Environment Variables

Ensure these are set in production:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
NODE_ENV=production
```

### 3. Supabase-Specific Considerations

**Connection Limits**:

- Supabase Free: 60 connections
- Supabase Pro: 200 connections
- Supabase Team: 400 connections

**Best Practices**:

- Set pool max lower than your Supabase limit
- Use connection pooling mode in Supabase (PgBouncer)
- Consider using Supabase's connection pooler URL: `postgresql://postgres:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 4. Graceful Shutdown

Add to your `drizzle/db.ts`:

```typescript
// Graceful shutdown handler
if (typeof process !== "undefined") {
    const shutdown = async () => {
        console.log("Closing database connections...");
        await client.end();
        process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}
```

### 5. Monitoring & Debugging

**Add Connection Monitoring**:

```typescript
// Log connection events (development only)
if (process.env.NODE_ENV === "development") {
    client.on("connect", () => console.log("DB connected"));
    client.on("disconnect", () => console.log("DB disconnected"));
    client.on("error", (err) => console.error("DB error:", err));
}
```

**Supabase Dashboard**: Monitor connection usage in your Supabase dashboard under Database > Logs.

### 6. Performance Optimizations

**Query Optimization**:

- Use `db.select()` instead of `db.query` for better performance
- Implement proper indexes on frequently queried columns
- Use `limit()` and `offset()` for pagination

**Connection Strategy**:

- Keep connections alive during high traffic
- Use read replicas for read-heavy operations (Supabase Pro+)

### 7. Error Handling

```typescript
// Robust error handling
export const executeQuery = async (queryFn: () => Promise<any>) => {
    try {
        return await queryFn();
    } catch (error) {
        console.error("Database query failed:", error);
        throw new Error("Database operation failed");
    }
};
```

### 8. Alternative: Switch to pg Pool

If you need more control, consider switching to `pg` pool:

```typescript
// Alternative setup with pg pool
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
```

### 9. Load Testing

Before production:

- Test with expected concurrent users
- Monitor connection pool exhaustion
- Verify graceful degradation under load

### 10. Deployment Platform Considerations

**Vercel**:

- Functions are stateless, connections reset per invocation
- Consider using edge runtime for better performance
- Monitor function timeout limits

**Docker/VPS**:

- Ensure proper container shutdown handling
- Set resource limits appropriately
- Monitor memory usage

## Action Items

1. ✅ Update `drizzle/db.ts` with production-ready pool configuration
2. ✅ Add graceful shutdown handlers
3. ✅ Set up connection monitoring
4. ✅ Test connection limits in staging environment
5. ✅ Configure Supabase connection pooler if needed
6. ✅ Document connection limits for your team

## Quick Fix for Current Setup

Minimal changes to make your current setup production-ready:

```typescript
const client = postgres(process.env.DATABASE_URL, {
    max: 15, // Safe for most Supabase plans
    prepare: false, // Better Supabase compatibility
});
```
