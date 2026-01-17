# Timezone Architecture (Simplified)

## Overview

**NEW ARCHITECTURE (Wall Clock Time):**

- **Database:** Stores all times as `TIMESTAMP` (Without Time Zone).
- **Format:** ISO 8601 string (e.g., `2024-01-01T10:00:00`) representing the "Wall Clock Time" at the school's location.
- **No Conversion:**
    - **Client:** Sends `10:00` -> **Server:** Receives `10:00` -> **DB:** Stores `10:00`.
    - **DB:** Returns `10:00` -> **Server:** Returns `10:00` -> **Client:** Displays `10:00`.

This approach treats time as absolute/local to the entity, ignoring the server's timezone or the user's browser timezone offset.

## Why this works

Since this application is school-centric, and all events happen at the school's physical location, the time displayed is always the time on the wall at that location. We do not need to calculate offsets relative to UTC for display purposes.

## Key Changes

1.  **Schema:** `event.date` is now `TIMESTAMP` (was `TIMESTAMP WITH TIME ZONE`).
2.  **RPC:** `get_event_transaction` returns `date` directly.
3.  **Codebase:** Removed all `convertUTCToSchoolTimezone` and `convertSchoolTimeToUTC` logic.
4.  **Getters:** Deleted `getters/timezone-getter.ts`.

## Data Flow

```
Client (School in Spain)
User selects: 10:00
   ↓
API Request: { date: "2024-01-01T10:00:00" }
   ↓
Server Action: createClassboardEvent
   ↓
Database Insert: 2024-01-01 10:00:00 (TIMESTAMP)
```

```
Database Select: 2024-01-01 10:00:00
   ↓
Server Action: getSQLClassboardData
   ↓
API Response: { date: "2024-01-01T10:00:00" }
   ↓
Client Display: 10:00
```