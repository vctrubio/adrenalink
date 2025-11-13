# Adrenalink Migration Document
**Migration from kite-hostel to adrenalink repository**
**Date: November 14, 2025**

## Overview
This document tracks the migration from the kite-hostel codebase to the new adrenalink-beta repository. Major architectural changes, timezone support, and realtime enhancements have been implemented.

---

## 1. Core Architecture Changes

### 1.1 Portal Components Refactoring
**Location**: `src/portals/`

Migrated from static page routes to dynamic server/client separation pattern:

- **`StudentPortal.tsx`** - Client component for student dashboard with real-time event listening
- **`TeacherPortal.tsx`** - Client component for teacher dashboard with real-time event listening
- **`StudentPortalClient.tsx`** - Server component wrapper managing state updates
- **`TeacherPortalClient.tsx`** - Server component wrapper managing state updates
- **`index.ts`** - Barrel export for clean imports

**Key Changes**:
- Separated data fetching (server) from UI rendering (client)
- Real-time event listeners for instant updates
- Toast notifications for event changes (add/remove)
- ISO date formatting with consistent `'en-US'` locale

**Routes**:
- `/student/[id]` - Dynamic student portal page
- `/teacher/[id]` - Dynamic teacher portal page

### 1.2 Navigation Integration
Added "View Portal" quick-access links in admin databoard:

- `src/app/(admin)/(databoard)/students/[id]/page.tsx`
- `src/app/(admin)/(databoard)/teachers/[id]/page.tsx`

---

## 2. Database Schema Evolution

### 2.1 Timezone Support (TIMESTAMPTZ)
**File**: `drizzle/schema.ts`

All timestamp columns updated to support timezone-aware storage:

```typescript
// Before
createdAt: timestamp("created_at").defaultNow().notNull()

// After
createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
```

**Tables Updated** (21 total):
- school, schoolPackage, equipment, student
- studentPackage, studentPackageStudent, schoolStudents
- referral, teacher, teacherCommission
- booking, lesson, event, equipmentEvent, equipmentRepair
- studentLessonFeedback, rental, teacherEquipment, teacherLessonPayment
- studentBookingPayment

### 2.2 School Timezone Field
**File**: `drizzle/schema.ts`

Added IANA timezone storage to school table:

```typescript
timezone: varchar("timezone", { length: 50 }),
// Example: "Europe/Madrid", "America/New_York", "Asia/Tokyo"
```

---

## 3. Timezone Infrastructure

### 3.1 Utility Functions
**File**: `src/getters/timezone-getter.ts` (NEW)

Timezone parsing and formatting utilities:

- `parseDate(dateStr)` - Parse date strings (YYYY-MM-DD or ISO) to full timestamps
- `getTimeFromISO(isoDate)` - Format ISO to HH:mm
- `getDateFromISO(isoDate)` - Format ISO to MM/DD/YYYY
- `getDateTimeFromISO(isoDate)` - Format ISO to full datetime
- `getTimezoneOffset(isoDate)` - Extract timezone offset string

### 3.2 Header Helpers
**File**: `types/headers.ts`

New timezone resolution function:

```typescript
export async function getSchoolTimezoneFromHeader(): Promise<string | null>
```

- Reads timezone from school record via `x-school-username` header
- Cached for 1 hour for performance
- Returns IANA timezone string (e.g., "Europe/Madrid")

---

## 4. Duration Utilities
**File**: `src/getters/duration-getter.ts` (NEW)

Duration formatting and manipulation:

- `getPrettyDuration(minutes)` - Format minutes to readable string (e.g., "1h 30 min")
- `adjustDuration(duration, direction)` - Adjust duration by 15-minute increments
- `isValidDuration(minutes)` - Validate duration against increment
- `minutesToHours(minutes)` & `hoursToMinutes(hours)` - Conversion utilities

**Constant**:
```typescript
DURATION_INCREMENT = 15 // minutes
```

---

## 5. Realtime Enhancements

### 5.1 Realtime Configuration
**Files**:
- `drizzle/scripts/alter-listen.ts`
- `drizzle/scripts/seed-rev10.ts`

All critical tables configured for Supabase Realtime with proper publish operations:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE booking
ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete') FOR TABLE booking
```

**Tables Configured**:
- `booking` - INSERT, UPDATE, DELETE events
- `event` - INSERT, UPDATE, DELETE events
- `lesson` - INSERT, UPDATE, DELETE events

### 5.2 Subscription Timing Fix
**File**: `src/supabase/subscribe/adminClassboardBookingListener.ts`

Fixed race condition where first booking wasn't listened to:

- Track subscription readiness with `isSubscribedRef`
- Ignore events before subscription established
- Auto-refresh data when subscription becomes active
- Handle connection errors and channel closure

---

## 6. Booking & Event Creation

### 6.1 Date Parsing Enhancement
**File**: `actions/register-action.ts`

Updated `masterBookingAdd()` to properly handle timezone-aware timestamps:

```typescript
const dateStartTimestamp = parseDate(dateStart);    // Uses timezone-getter utility
const dateEndTimestamp = parseDate(dateEnd);        // Converts YYYY-MM-DD → full timestamp

// Store as ISO strings
dateStart: dateStartTimestamp.toISOString(),
dateEnd: dateEndTimestamp.toISOString(),
```

### 6.2 Event Creation with Timezone
**File**: `actions/classboard-action.ts`

Event creation logs timezone information for audit trail:

```typescript
console.log(`📍 Event timezone info:`, {
    inputDate: eventDate,
    parsedDate: eventDateTime.toISOString(),
    timezoneOffset: eventDateTime.getTimezoneOffset(),
});
```

---

## 7. Seed Data & Configuration

### 7.1 Enhanced Seed Script
**File**: `drizzle/scripts/seed-rev10.ts`

**School Configuration**:
- Name: "Reva Kite School"
- Location: Madrid, Spain
- Coordinates: 40.4168, -3.7038
- Timezone: "Europe/Madrid"

**Expanded School Packages** (8 total):
1. Private Kite Lesson (1 student, 120 min, €120)
2. Private Wing Lesson (1 student, 90 min, €90)
3. 3h Kite Rental (1 student, 180 min, €80)
4. 3h Wing Rental (1 student, 180 min, €70)
5. **Duo Kite Lesson** (2 students, 120 min, €75) - NEW
6. **Group Wing Lesson** (3 students, 150 min, €65) - NEW
7. **Team Kite Lesson** (4 students, 180 min, €55) - NEW
8. **Large Group Wing Class** (5 students, 240 min, €50) - NEW

**Integrated Realtime Setup**:
- Automatically configures booking, event, and lesson table publications
- No need to run `db:alter-listen` separately

---

## 8. Package Management

### 8.1 Removed Dependencies
- `geo-tz` - Removed due to large dataset and installation hang issues
- **Alternative**: Store timezone directly in school record

### 8.2 NPM Scripts Updated
**File**: `package.json`

```json
"db:workflow": "bun run db:generate && bun run db:migrate && bun run db:push && bun run db:alter-listen",
"db:reset": "bun run db:clear && bun run db:push && bun run db:alter-listen",
"db:fresh": "bun run db:clear-meta && bun run db:push && bun run db:alter-listen",
"db:complete-setup": "bun run db:workflow && bun run rev10"
```

---

## 9. File Summary

### New Files Created
- `src/getters/timezone-getter.ts` - Timezone utilities
- `src/getters/duration-getter.ts` - Duration utilities
- `src/portals/StudentPortal.tsx` - Student dashboard component
- `src/portals/TeacherPortal.tsx` - Teacher dashboard component
- `src/portals/StudentPortalClient.tsx` - Student wrapper component
- `src/portals/TeacherPortalClient.tsx` - Teacher wrapper component
- `src/portals/index.ts` - Barrel export

### Modified Files
- `drizzle/schema.ts` - Timezone support + school.timezone field
- `drizzle/scripts/seed-rev10.ts` - Enhanced packages + realtime setup
- `drizzle/scripts/alter-listen.ts` - Booking table realtime config
- `actions/register-action.ts` - Date parsing with timezone
- `actions/classboard-action.ts` - Timezone logging in event creation
- `types/headers.ts` - School timezone header helper
- `src/supabase/subscribe/adminClassboardBookingListener.ts` - Subscription timing fix
- `src/app/(admin)/(databoard)/students/[id]/page.tsx` - Portal navigation link
- `src/app/(admin)/(databoard)/teachers/[id]/page.tsx` - Portal navigation link
- `src/app/(users)/student/[id]/page.tsx` - Portal page
- `src/app/(users)/teacher/[id]/page.tsx` - Portal page
- `package.json` - Updated scripts

---

## 10. Migration Checklist

- ✅ Timezone support added to all timestamps (TIMESTAMPTZ)
- ✅ School timezone field added to schema
- ✅ Timezone utilities created (timezone-getter.ts, duration-getter.ts)
- ✅ Portal components refactored (StudentPortal, TeacherPortal)
- ✅ Realtime listeners configured for booking, event, lesson
- ✅ Subscription timing race condition fixed
- ✅ Date parsing enhanced with timezone awareness
- ✅ Seed script updated with Madrid coordinates and 4 new packages
- ✅ Navigation links added to admin databoard
- ✅ NPM scripts consolidated (no need for separate db:alter-listen)

---

## 11. Deployment Instructions

### Step 1: Install Dependencies
```bash
bun install
```

### Step 2: Run Full Setup
```bash
bun run db:complete-setup
```

This will:
1. Generate migrations from schema changes
2. Apply migrations to database
3. Push schema to Supabase
4. Configure Realtime for all tables
5. Seed database with Madrid school + 8 packages + 2 teachers + 8 students

### Step 3: Verify
- ✅ Check Supabase Realtime publications are configured
- ✅ Test booking creation shows in classboard immediately
- ✅ Test event creation shows in both classboards
- ✅ Test portal navigation from admin databoard

---

## 12. Known Issues & Resolutions

### Issue: `geo-tz` package installation hangs
**Resolution**: Removed dependency. Timezone now stored directly in school record.

### Issue: First booking not listened to in realtime
**Resolution**: Fixed subscription timing race condition. Listener now:
- Tracks subscription readiness
- Auto-refreshes when subscription active
- Ignores events before subscription established

### Issue: Date formatting hydration mismatch
**Resolution**: All date formatting now uses consistent `'en-US'` locale.

---

## 13. Future Enhancements

- [ ] Add timezone selector UI in school admin settings
- [ ] Auto-calculate timezone from Google Maps coordinates
- [ ] Support multiple timezones per school location
- [ ] Add timezone preference for individual users
- [ ] Schedule events in user's local timezone
- [ ] Display timezone offset in all timestamp displays

---

## 14. Migration Status

**Status**: ✅ COMPLETE - Ready for Production

All critical components migrated and tested. Timezone support fully integrated. Realtime listeners working correctly. Ready for deployment to production environment.
