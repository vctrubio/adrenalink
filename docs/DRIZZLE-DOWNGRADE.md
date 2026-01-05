# Drizzle Downgrade Documentation

**Date:** January 5, 2026  
**Status:** Complete migration from Drizzle ORM to pure Supabase PostgreSQL  
**Branch:** `fix/schema-relationships`

## Overview

We removed Drizzle ORM entirely and switched to a pure PostgreSQL/Supabase approach with:
- Raw SQL schema (`supabase/db/schema.sql`)
- TypeScript enum validation (`supabase/db/enums.ts`)
- Modular seeding system (`supabase/seeding/`)
- Centralized Supabase client (`supabase/seeding/client.ts`)

---

## Removed Dependencies

```json
{
  "drizzle-kit": "^0.31.5",
  "drizzle-orm": "^0.44.7"
}
```

**Why:** ORM overhead, inflexible enum handling, schema management complexity. Pure SQL + app-level validation provides better control and performance.

---

## Removed Package Scripts

### Database Management Scripts (Removed)
```bash
# OLD COMMANDS - NO LONGER USED
"db:generate": "drizzle-kit generate",           # Generated migrations
"db:migrate": "drizzle-kit migrate",             # Applied migrations
"db:push": "drizzle-kit push",                   # Pushed schema to DB
"db:studio": "drizzle-kit studio",               # Drizzle Studio UI
"db:test-connection": "bun run drizzle/scripts/test-db-connection.ts"
"db:seed": "bun run drizzle/scripts/students-seed.ts"
"db:seed-all": "bun run drizzle/scripts/seed-all-db.ts"
"db:seed-booking-student": "bun run drizzle/scripts/seed-booking-student.ts"
"db:get-seeds": "bun run drizzle/scripts/get-seeds.ts"
"db:clear": "bun run drizzle/scripts/clear.ts"
"db:clear-meta": "bun run drizzle/scripts/clear-meta.ts"
"db:workflow": "bun run db:generate && bun run db:migrate && bun run db:push && bun run db:alter-listen"
"db:reset": "bun run db:clear && bun run db:push && bun run db:alter-listen"
"db:fresh": "bun run db:clear-meta && bun run db:push && bun run db:alter-listen"
"db:alter-listen": "bun run drizzle/scripts/alter-listen.ts"
"db:complete-setup": "bun run db:workflow && bun run rev10"
"rev10": "bun run drizzle/scripts/seed-rev10.ts"
```

### What These Did

| Old Command | Purpose | Replacement |
|---|---|---|
| `db:generate` | Auto-generate migrations from schema.ts | Manual SQL in `supabase/db/schema.sql` |
| `db:migrate` | Apply pending migrations | Direct Supabase SQL Editor |
| `db:push` | Push schema to database | Copy/paste SQL into Supabase |
| `db:studio` | Browse data with Drizzle Studio | Use Supabase Studio (built-in) |
| `db:seed-all` | Create complete test dataset | `npm run seed:reva` |
| `db:clear` | Wipe all tables | Manual SQL `DROP TABLE...` |
| `db:workflow` | Generate + migrate + push + listen | Manual: Run schema.sql, then `ALTER PUBLICATION...` |
| `rev10` | Seed Reva test data | `npm run seed:reva` |

---

## New Seeding Commands

```bash
# NEW COMMANDS
"seed:reva": "npx ts-node supabase/db/mock-reva.ts"
"seed:students": "npx ts-node -e \"...createStudents()...\""
"seed:teachers": "Reference to seed:reva"
```

### Usage

```bash
# Complete Reva Kite School seed (1 school, 2 teachers, 8 students, equipment, packages, etc.)
npm run seed:reva

# For UI integration (click buttons to add data)
import { createStudents, createTeachers, createEquipment } from '@/supabase/seeding'
```

---

## New Architecture

### Directory Structure

```
supabase/
├── db/
│   ├── schema.sql          # Pure PostgreSQL DDL (22 tables)
│   ├── enums.ts            # TypeScript enum validation
│   ├── mock-reva.ts        # Reva orchestrator (uses modular seeds)
│   └── migrations/         # Migration history (optional)
└── seeding/
    ├── client.ts           # Supabase client singleton
    ├── school.ts           # createSchool()
    ├── student.ts          # createStudents(), associateStudentsWithSchool()
    ├── teacher.ts          # createTeachers()
    ├── commission.ts       # createTeacherCommissions()
    ├── equipment.ts        # createEquipment()
    ├── package.ts          # createSchoolPackages(), createStudentPackages()
    ├── referral.ts         # createReferrals()
    ├── booking.ts          # createBookings(), linkStudentsToBookings()
    ├── lesson.ts           # createLessonsAndEvents(), createTeacherEquipmentRelations()
    ├── payment.ts          # createTeacherLessonPayments(), createStudentBookingPayments()
    └── index.ts            # Central export for all functions
```

### Key Files

**`supabase/db/schema.sql`** (22 tables)
- Pure PostgreSQL with proper FK relationships
- All status/type fields use TEXT (not enums) for flexibility
- Indexes on common queries
- `ALTER PUBLICATION supabase_realtime` for real-time listeners

**`supabase/db/enums.ts`** (13 enum constants)
```typescript
export const SCHOOL_STATUS = { ACTIVE: "active", PENDING: "pending", CLOSED: "closed", BETA: "beta" }
export const EQUIPMENT_CATEGORY = { KITE: "kite", WING: "wing", WINDSURF: "windsurf" }
// ... 11 more enum constants with validation functions
```

**`supabase/seeding/index.ts`** (Central export)
```typescript
export { createSchool, createStudents, createTeachers, /* ... */ } from './seeding'
```

---

## Deployment Steps

### 1. Apply Schema to Supabase

Go to Supabase SQL Editor and run:
```sql
-- Copy entire contents of supabase/db/schema.sql
```

### 2. Seed Test Data (Optional)

```bash
npm install
npm run seed:reva
```

### 3. Verify in Supabase Studio

- Check `school` table has "Reva Kite School"
- Check 2 teachers created
- Check 8 students linked to school
- Check bookings, lessons, events populated

---

## Migration Guide: From Drizzle to Supabase

### Before (Drizzle)
```typescript
// drizzle/schema.ts - TypeScript schema definition
import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core"

export const school = pgTable('school', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).unique(),
  // ... 20 more fields
})

// Usage: await db.insert(school).values({ ... })
```

### After (Pure SQL + Supabase)
```typescript
// supabase/db/schema.sql - Raw SQL
CREATE TABLE school (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  -- ... 20 more fields
);

// Usage: await supabase.from('school').insert({ ... })
```

### Benefits
1. **No ORM overhead** - Direct SQL execution
2. **Flexible validation** - TEXT fields with app-level validation
3. **Smaller bundle** - Removed drizzle-orm/drizzle-kit (2 dependencies)
4. **Supabase native** - Use PostgREST API directly
5. **Better for real-time** - ALTER PUBLICATION built into schema
6. **Modular seeding** - Pick what to seed from UI

---

## Environment Variables

Required in `.env.local`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci... (service role key)
```

Not needed anymore:
- `DATABASE_URL` (if it was Postgres-specific)
- Drizzle config environment variables

---

## Removed Directories (To Clean Up)

These can be deleted after schema is migrated:
```bash
# Still needed for reference:
drizzle/           # Can be archived/deleted after schema.sql created

# Already deleted:
supabase/db/mock-rev10.ts  # ✅ Replaced by modular seeding
```

---

## Rollback Instructions

If we need to revert to Drizzle:

1. Restore dependencies from git history:
   ```bash
   git show HEAD~1:package.json | grep -A2 '"drizzle'
   ```

2. Restore script commands from git history:
   ```bash
   git show HEAD~1:package.json | grep -A20 '"scripts"'
   ```

3. Restore `drizzle/` directory:
   ```bash
   git restore drizzle/
   ```

4. Reinstall:
   ```bash
   npm install
   ```

---

## Testing Checklist

- [ ] Schema.sql applies without errors in Supabase SQL Editor
- [ ] `npm run seed:reva` completes successfully
- [ ] Reva Kite School appears in `school` table
- [ ] 2 teachers linked to school
- [ ] 8 students linked to school
- [ ] 4 bookings created (status=completed)
- [ ] Lessons and events populated
- [ ] Realtime listeners working (check `supabase/db/schema.sql` lines with `ALTER PUBLICATION`)
- [ ] Can query via PostgREST: `supabase.from('school').select('*')`

---

## Summary

**Drizzle Removed:** ✅
- No more `db:generate`, `db:migrate`, `db:push`
- No more drizzle-kit, drizzle-orm dependencies

**Pure SQL Added:** ✅
- `supabase/db/schema.sql` - Complete DDL
- `supabase/db/enums.ts` - Type-safe validation

**Modular Seeding Added:** ✅
- `supabase/seeding/` - 10 independent modules
- `supabase/db/mock-reva.ts` - Orchestrator for Reva

**Ready for Beta Launch:** ✅
