# Fetching to Supabase Effectively

## Current Situation
We are currently using `drizzle-orm` with the `postgres.js` driver in a Next.js environment (Server Actions).
- **Driver:** `postgres` (postgres.js)
- **Pattern:** Direct SQL execution (`db.execute(sql...)`) and Drizzle Query Builder (`db.query...`).
- **Risk:** Server Actions run in serverless/edge environments. Every invocation might spin up a new instance. If `postgres.js` creates a default connection pool (e.g., 10 connections) for *every* instance, we will rapidly exhaust Supabase's `max_clients` limit (typically 100 for direct connections).

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
*(Note: `postgres.js` handles this differently than `node-postgres`. We need to verify if `postgres.js` tries to prepare statements named-ly. Usually simply using `client` is fine, but we must ensure we don't hold the connection open unnecessarily.)*

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
