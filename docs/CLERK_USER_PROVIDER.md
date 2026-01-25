# Clerk User Provider & Auth Architecture (Multi-School)

## Overview

Adrenalink uses a **Hybrid Multi-Tenant Architecture**. While Clerk handles global authentication, our Postgres database defines the specific relationships (roles) between users and schools.

### The Core Thesis

1.  **Database as Source of Truth**: User roles are defined by records in Postgres, linked via `clerk_id`.
2.  **Metadata as Multi-Tenant Cache**: To avoid DB lookups on every request, we sync the user's entire school portfolio into Clerk's `publicMetadata.schools`.
3.  **Middleware as Context Selector**: The middleware identifies the school from the subdomain and selects the matching context from the user's metadata.

---

## Metadata Structure

The `publicMetadata` follows this strict schema. All school-specific context is nested within the `schools` object.

```json
{
  "schools": {
    "uuid-school-1": {
      "role": "student",
      "entityId": "uuid-student-123",
      "isActive": true,
      "isRental": false,
      "schoolId": "uuid-school-1"
    },
    "uuid-school-2": {
      "role": "teacher",
      "entityId": "uuid-teacher-456",
      "isActive": true,
      "isRental": false,
      "schoolId": "uuid-school-2"
    }
  }
}
```

---

## Data Flow & Resolution

### 1. The Sync Engine (`supabase/server/clerk-sync.ts`)
Triggered whenever an identity is linked or a student profile is created.
- **Action**: Sweeps all relevant tables for the `clerk_id`.
- **Precedence**: within a single school context, Staff roles (`owner` > `teacher`) take precedence over `student` roles if a user happens to have both.
- **Result**: Completely rebuilds the `schools` map in Clerk and nulls out any legacy top-level keys.

### 2. The Proxy Layer (`src/proxy.ts`)
**Edge Resolution**
1. Detects `subdomain` -> `schoolId`.
2. Extracts `schools` map from Clerk session claims.
3. **Selector**: `const context = schools[schoolId]`.
4. **Injection**: Sets `x-user-role`, `x-user-entity-id`, and `x-user-authorized` headers.

### 3. The Application Layer (`src/providers/user-school-provider.ts`)
**Hydration**
Consumes the headers or re-reads the metadata map to provide a typed `UserSchoolContext`. It ensures that the app context reflects only the identity held for the active school domain.

---

## Best Practices

- **Atomic Sync**: Always sync the *entire* user portfolio to ensure the cache is consistent.
- **No Global Role**: Never rely on a top-level `role` or `entityId`. Always resolve via the current school ID.
- **Clean Metadata**: Keep the top-level metadata object empty (except for the `schools` key) to prevent authorization leaks or stale data usage.
