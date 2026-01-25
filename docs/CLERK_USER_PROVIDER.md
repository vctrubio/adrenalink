# Clerk User Provider & Auth Architecture (Multi-School)

## Overview

Adrenalink uses a **Hybrid Multi-Tenant Architecture**. While Clerk handles global authentication, our Postgres database defines the specific relationships (roles) between users and schools.

### The Core Thesis

1.  **Database as Source of Truth**: User roles are defined by records in Postgres, linked via `clerk_id`.
2.  **Metadata as Multi-Tenant Cache**: To avoid DB lookups on every request, we sync the user's entire school portfolio into Clerk's `publicMetadata.schools`.
3.  **Middleware as Context Selector**: The middleware identifies the school from the subdomain and selects the matching context from the user's metadata.

---

## Identity Partitions

To maintain system integrity and a clean UX, every Clerk user is locked into one of two partitions. This is enforced by the **Sync Engine**.

### 1. Staff Partition
- **Roles**: `owner`, `school_admin`, `teacher`.
- **Logic**: A user can be an Owner of School A and a Teacher at School B.
- **Precedence (per school)**: `owner` > `school_admin` > `teacher`.

### 2. Student Partition
- **Roles**: `student`.
- **Logic**: A user can be a Student at multiple schools (e.g., for different sports or locations).
- **Constraint**: **NEVER** overlapping with the Staff Partition. A Teacher cannot be a Student.

---

## Metadata Structure

The `publicMetadata` follows this schema:

```json
{
  "partition": "staff", // "staff" or "student"
  "schools": {
    "uuid-school-1": {
      "role": "owner",
      "entityId": "uuid-school-1",
      "isActive": true
    },
    "uuid-school-2": {
      "role": "teacher",
      "entityId": "uuid-teacher-456",
      "isActive": true
    }
  }
}
```

---

## Data Flow & Resolution

### 1. The Sync Engine (`supabase/server/clerk-sync.ts`)
Triggered whenever an identity is linked or a student profile is created.
- **Action**: Sweeps all relevant tables for the `clerk_id`.
- **Partition Check**: If it finds any Staff records, it ignores/prevents Student records.
- **Result**: Completely overwrites the `schools` map in Clerk.

### 2. The Proxy Layer (`src/proxy.ts`)
**Edge Resolution**
1. Detects `subdomain` -> `schoolId`.
2. Extracts `schools` map from Clerk session.
3. **Selector**: `const context = schools[schoolId] || { role: 'guest' }`.
4. **Injection**: Sets `x-user-role`, `x-user-entity-id`, and `x-user-authorized`.

### 3. The Application Layer (`src/providers/user-school-provider.ts`)
**Hydration**
Consumes headers to provide a typed `UserSchoolContext`. It ensures that even if a user has 10 roles, the app only "sees" the one relevant to the current school.

---

## Key Files & Responsibilities

- **`supabase/server/clerk-sync.ts`**: Rebuilds the global school map.
- **`src/proxy.ts`**: Filters the map for the current request.
- **`src/providers/user-school-provider.ts`**: Provides the context to Server Components.
- **`src/components/modals/LinkEntityToClerk.tsx`**: UI to trigger the Sync Engine.

---

## Best Practices

- **Atomic Sync**: Always sync the *entire* user portfolio, never partial updates to the `schools` map.
- **Header Reliance**: Server Components should prefer headers (via `getUserSchoolContext`) for role checks to stay in sync with the Proxy's authorization.
- **Partition Integrity**: Frontend registration flows must check the user's existing partition before allowing them to link a conflicting role.