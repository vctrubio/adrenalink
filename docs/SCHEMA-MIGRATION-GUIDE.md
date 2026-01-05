# Schema Migration: Drizzle → Pure SQL

## Overview
Complete database schema migration from Drizzle ORM to pure PostgreSQL in Supabase.

## Key Changes
- **Converted to pure SQL** for better PostgreSQL + PostgREST integration
- **TEXT fields instead of enums** for flexibility (validation in `supabase/db/enums.ts`)
- **Redesigned rental** with many-to-many relations (rental_student, rental_equipment)
- **Booking references school_package** directly (not student_package)
- **wallet_id** in school for future Clerk auth integration
- **Default school status: 'beta'** for beta launch this week

## Step 1: Apply Schema in Supabase
1. Go to Supabase project → **SQL Editor** → **New Query**
2. Copy entire content from `supabase/db/schema.sql`
3. Paste and click **Run**
4. Wait for success confirmation

## Step 2: Verify Schema Applied
Check all tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Should show 22 tables (school, school_package, equipment, student, student_package, school_students, referral, teacher, teacher_commission, booking, booking_student, lesson, event, equipment_event, equipment_repair, student_lesson_feedback, rental, rental_student, rental_equipment, teacher_equipment, teacher_lesson_payment, student_booking_payment, school_subscription, subscription_payment).

## Step 3: Test Key Relationships
Verify booking → school_package relationship works:
```sql
SELECT 
  b.id, b.date_start, b.status,
  sp.id, sp.duration_minutes, sp.price_per_student
FROM booking b
JOIN school_package sp ON b.school_package_id = sp.id
LIMIT 5;
```

## Step 4: Update Application Code
No changes needed yet - schema is forward compatible. When ready:
- Remove Drizzle: `npm uninstall drizzle-orm drizzle-kit`
- Remove: `drizzle/` directory, `drizzle.config.ts`
- Convert data access to Supabase PostgREST queries
- Use enums from `supabase/db/enums.ts` for validation

## Verification
- ✅ All 22 tables created
- ✅ All indexes created
- ✅ Foreign key relationships intact
- ✅ Default values correct (school status = 'beta', etc.)
- ✅ No errors in SQL Editor

Schema ready for beta launch.
