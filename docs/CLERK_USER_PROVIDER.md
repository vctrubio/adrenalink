# Clerk User Provider & Auth Architecture

## Overview

Adrenalink uses a **Hybrid Authentication Architecture** that combines the security and convenience of Clerk with the complex data relationships of our Postgres database.

### The Core Thesis

1.  **Database as Source of Truth**: User roles (`teacher`, `student`, `school_admin`) are defined solely by records in the Postgres database, linked via `clerk_id`.
2.  **Metadata as Cache**: To avoid hitting the database on every request, we **sync** the determined role and context into Clerk's `publicMetadata` upon login.
3.  **Middleware as Gatekeeper**: The `src/proxy.ts` middleware reads this metadata from the session token to enforce access control instantly, without database latency.

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

## Best Practices

- **NEVER** trust the metadata for critical writes. Always validate against the database in Server Actions using the `entityId`.
- **ALWAYS** run `syncUserRole` when creating a new Teacher or Student record to ensure their login session reflects the new status immediately.
- **DO NOT** add sensitive PII to metadata. Keep it strictly to IDs and status flags.
