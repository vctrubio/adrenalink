# Production Build Optimization & Debugging

**Date:** January 27, 2026
**Environment:** Next.js 16.1.0, Supabase, Clerk, Bun (Darwin)
**Topic:** Resolving Request Loops and Optimization in `bun run start`

## 1. Issue Description

The application behaves differently in Development (`bun run dev`) vs Production (`bun run start`).

-   **Development:** Requests are clean, single executions.
-   **Production:** A single page load triggers a cascade of requests to multiple routes (`/classboard`, `/onboarding`, `/invitations`, `/register`, etc.) appearing as an infinite loop or excessive spam in the logs.

## 2. Logs Analysis

### Development Log (Normal)
```text
//////////////////////////////// STARTING: /classboard //////////////////////////////
🚀 [REQUEST START] { ... pathname: '/classboard' ... }
DEV:DEBUG ✅ SUBDOMAIN DETECTED: berkley
🔎 [Proxy] Looking up school for subdomain: berkley
✅ [Proxy] School found: ...
```
One request, one DB lookup, one success.

### Production Log (Problematic)
```text
//////////////////////////////// STARTING: /classboard //////////////////////////////
🚀 [REQUEST START] ...
DEV:DEBUG ✅ SUBDOMAIN DETECTED: berkley
🔎 [Proxy] Looking up school for subdomain: berkley

//////////////////////////////// STARTING: /onboarding //////////////////////////////
🚀 [REQUEST START] ...
//////////////////////////////// STARTING: /invitations //////////////////////////////
🚀 [REQUEST START] ...
//////////////////////////////// STARTING: /register //////////////////////////////
🚀 [REQUEST START] ...
//////////////////////////////// STARTING: /home //////////////////////////////
🚀 [REQUEST START] ...
```
All happening within milliseconds of each other (e.g., `10:57:40.404` to `10:57:40.413`).

## 3. Root Cause Analysis

The "Loop" is likely **Next.js Production Prefetching**, not a redirect loop.

1.  **Aggressive Prefetching:** In production, Next.js `<Link>` components prefetch the Javascript and data for the target route when the link enters the viewport.
2.  **Middleware Execution:** Middleware runs for **every** request, including prefetches.
3.  **Heavy Middleware Logic:**
    -   The project uses `src/proxy.ts` as the middleware implementation (likely aliased or imported via a mechanism not immediately visible in `ls`, or simply the user refers to this logic as "proxy").
    -   It performs a **Supabase DB Query** (`school` table lookup) for *every single prefetch*.
    -   It **Logs to Console** for every single prefetch.
4.  **Result:** If a page has 10 links (navigation menu, sidebar), loading that page triggers 10+ immediate background requests. The middleware logs them all, looking like a "loop", and hammers the database.

## 4. Proposed Solution

We need to optimize `src/proxy.ts` to handle production traffic efficiently.

### A. Detect & Silence Prefetches
Next.js sends specific headers with prefetch requests. We should detect these and:
1.  **Reduce Logging:** distinct log prefix (e.g., `🚀 [PREFETCH]`) or suppress completely.
2.  **Lightweight Processing:** Ensure we don't do unnecessary heavy lifting if not needed (though auth/rewrite might still be needed).

**Headers to check:**
-   `purpose: prefetch`
-   `x-middleware-prefetch: 1` (Next.js internal)
-   `sec-fetch-purpose: prefetch`

### B. In-Memory Caching (Critical)
Since the middleware runs in the Edge/Node runtime, we can use a simple in-memory cache to store School ID lookups.
-   **Key:** `subdomain` (e.g., "berkley")
-   **Value:** `{ id: string, timezone: string, timestamp: number }`
-   **TTL:** 5-10 minutes.

**Benefit:**
-   First request hits DB.
-   Subsequent 50 prefetch requests hit RAM (instant, zero DB cost).

## 5. Implementation Plan

1.  **Update `src/proxy.ts`**:
    -   Add `SCHOOL_CACHE` (Map).
    -   Add `isPrefetch()` helper.
    -   Wrap DB lookup in cache logic.
    -   Conditional logging.
2.  **Verify**:
    -   Run `bun run build && bun run start`.
    -   Observe logs: Should see *one* "Request Start" and maybe several quiet "Prefetch" logs, but only *one* "Looking up school" DB log.