# Clerk User Provider & Auth Architecture

## Overview

Adrenalink uses a **Hybrid Authentication Architecture** that combines the security and convenience of Clerk with the complex data relationships of our Postgres database.

### The Core Thesis

1.  **Database as Source of Truth**: User roles (`teacher`, `student`, `school_admin`) are defined solely by records in the Postgres database, linked via `clerk_id`.
2.  **Metadata as Cache**: To avoid hitting the database on every request, we **sync** the determined role and context into Clerk's `publicMetadata` upon login.
3.  **Middleware as Gatekeeper**: The `src/proxy.ts` middleware reads this metadata from the session token to enforce access control instantly, without database latency.

---

## Dual-Layer Context

Our authentication state exists in two layers to balance performance at the Edge with rich data availability in the app.

### 1. The Proxy Layer (`src/proxy.ts`)
**Purpose: Edge Gatekeeper**
Happens at the Middleware level. It extracts the `role` and `schoolId` from the Clerk session and injects them as **HTTP Headers** (`x-user-role`, `x-school-id`, etc.).
- **Pros**: Zero-latency, available before routing, allows fast redirects/blocks at the Edge.
- **Headers**: Strictly strings (IDs, roles, authorization status).

### 2. The Application Layer (`types/user-school-provider.ts`)
**Purpose: rich Hydration**
Happens within Server Components. It consumes the headers set by the proxy (for School context) and calls Clerk's `currentUser()` to get the full user profile.
- **Pros**: Provides the full User object (names, email, full metadata object).
- **Function**: `getUserSchoolContext()` is the primary consumer.

---

## Data Flow

1.  **User Logs In** (via Clerk).
2.  **Sync Engine Runs**: A server action (`syncUserRole`) checks the database tables in order of precedence:
    *   **Owner**: Is `clerk_id` in `school` table?
    *   **Teacher**: Is `clerk_id` in `teacher` table?
    *   **Student**: Is `clerk_id` in `school_students` table?
3.  **Metadata Updated**: The engine writes the result to Clerk's `publicMetadata`.
    ```json
    {
      "role": "teacher",
      "schoolId": "uuid-123",
      "entityId": "uuid-456",
      "isActive": true
    }
    ```
4.  **Middleware Enforces**: Subsequent requests carry this metadata. `src/proxy.ts` reads it to allow/deny access to `/app/(users)/...` routes.

---

## Roles & Permissions

We support 5 distinct role contexts. A user can technically have multiple records, but the Sync Engine assigns a **Single Active Context** based on this precedence:

1.  **Owner** (`owner`): The primary account holder for a school.
    *   *Source*: `school` table (`clerk_id` column).
2.  **Admin** (`school_admin`): Operational administrators.
    *   *Source*: `school_admins` table (Planned).
3.  **Teacher** (`teacher`): Instructors.
    *   *Source*: `teacher` table.
4.  **Student** (`student`): Learners.
    *   *Source*: `school_students` table.
5.  **Guest** (`guest`): Authenticated users with no linked records.

---

## Key Files

### 1. Sync Engine: `supabase/server/clerk-sync.ts`
The brain of the operation. Call this after sign-up or when a user profile is created/updated.

```typescript
// Usage
await syncUserRole(clerkUserId);
```

### 2. Middleware: `src/proxy.ts`
Reads the session, extracts `schoolId` and `role` from metadata, and sets headers for downstream components.

### 3. Debugging: `/demo`
Visit `https://adrenalink.tech/demo` to see:
- Your current raw Clerk metadata.
- A visual legend of your active role context.
- Status flags (Active/Inactive, Rental status).

---

## Usage in Components

### Server Components
Use standard Clerk helpers. The metadata is already populated.

```typescript
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await currentUser();
  const role = user?.publicMetadata.role;
  const schoolId = user?.publicMetadata.schoolId;
  
  // ...
}
```

### Client Components
Use the `useUser` hook.

```typescript
"use client";
import { useUser } from "@clerk/nextjs";

export function MyComponent() {
  const { user } = useUser();
  const isTeacher = user?.publicMetadata.role === "teacher";
}
```

---

## Observability & User Journeys

The Dual-Layer Context is not just for permissions; it is the foundation for our backend observability and debugging strategy.

### 1. Request Tracing
Because the Proxy injects standard headers (`x-user-id`, `x-school-id`), our centralized `logger.ts` and `error-handlers.ts` can automatically decorate every backend log entry with this context.

### 2. Journey Pinpointing
We use this metadata to pinpoint the exact origin of issues across three dimensions:
- **Who**: Identify if an error is specific to a `userId` or a `role`.
- **Where**: Filter logs by `schoolId` to see if a bug is tenant-specific.
- **How**: Capture `userAgent` and browser context to correlate errors with specific client environments.

### 3. Log Decoration Goal
Every log entry in the backend should ideally follow this trace pattern:
`[LEVEL] [SCHOOL_ID] [USER_ID] [PATH] message {context}`

---

## Best Practices

- **NEVER** trust the metadata for critical writes. Always validate against the database in Server Actions using the `entityId`.
- **ALWAYS** run `syncUserRole` when creating a new Teacher or Student record to ensure their login session reflects the new status immediately.
- **DO NOT** add sensitive PII to metadata. Keep it strictly to IDs and status flags.
