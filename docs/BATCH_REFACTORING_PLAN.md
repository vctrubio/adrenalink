# Batch Refactoring Plan - Complete Codebase

Complete refactoring of 50+ files to use DRY helpers and centralized utilities.

## Progress

### ✅ Completed (Phase 1)

- [x] `supabase/server/register.ts` - 6 school context duplicates, console logs replaced
- [x] `src/proxy.ts` - Logger integration added
- [x] Auth system (types/auth-flags.ts, user-school-provider.ts updated)
- [x] DRY helpers (logger.ts, error-handlers.ts, school-context.ts, crud-helpers.ts)

### 📋 Remaining Files (34 files)

Files are organized by pattern and priority. Follow the order below to maximize impact.

---

## Phase 2: CRUD Operations (High Impact)

These files have direct create/update/delete operations that can use the `createItem()`, `updateItem()`, `deleteItem()` helpers.

**Files:**
1. `supabase/server/students.ts` - Multiple student CRUD operations
2. `supabase/server/teachers.ts` - Multiple teacher CRUD operations
3. `supabase/server/commissions.ts` - Create/update commissions
4. `supabase/server/lessons.ts` - Create/update lessons
5. `supabase/server/equipments.ts` - Create/update equipment
6. `supabase/server/packages.ts` - Create/update packages

**Pattern to Replace:**

```typescript
// BEFORE (12+ lines)
export async function createStudent(data) {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");
        if (!schoolId) return { success: false, error: "..." };

        const supabase = getServerConnection();
        const { data: result, error } = await supabase
            .from("student")
            .insert({ ...data, school_id: schoolId })
            .select()
            .single();

        if (error) {
            console.error("Error:", error);
            return { success: false, error: "Failed" };
        }

        revalidatePath("/students");
        return { success: true, data: result };
    } catch (error) {
        console.error("Unexpected:", error);
        return { success: false, error: "Failed" };
    }
}

// AFTER (3 lines)
export async function createStudent(data) {
    return createItem("student", data, "/students");
}
```

**Migration Script:**

For each file:
1. Add imports at top:
   ```typescript
   import { getSchoolContextOrFail } from "@/backend/school-context";
   import { handleSupabaseError, isUniqueConstraintError } from "@/backend/error-handlers";
   import { logger } from "@/backend/logger";
   import { createItem, updateItem, deleteItem } from "@/backend/crud-helpers";
   ```

2. Replace school context retrieval:
   ```typescript
   // OLD
   const headersList = await headers();
   const schoolId = headersList.get("x-school-id");
   if (!schoolId) return { success: false, error: "..." };

   // NEW
   const contextResult = await getSchoolContextOrFail();
   if (!contextResult.success) return contextResult;
   const { schoolId } = contextResult.data;
   ```

3. Replace CRUD operations:
   ```typescript
   // OLD
   export async function createStudent(data) {
       // ... 15 lines of boilerplate ...
   }

   // NEW
   export async function createStudent(data) {
       return createItem("student", data, "/students");
   }
   ```

4. Replace console.error with logger:
   ```typescript
   // OLD
   console.error("Error creating student:", error);

   // NEW
   logger.error("Failed to create student", error);
   ```

5. Replace error handling:
   ```typescript
   // OLD
   if (error?.code === "23505" || error?.message?.includes("unique constraint")) {
       return { success: false, error: "..." };
   }

   // NEW
   if (isUniqueConstraintError(error)) {
       return { success: false, error: "..." };
   }
   ```

---

## Phase 3: Status Updates (Medium Impact)

These files update entity status flags. They're very repetitive.

**Files:**
1. `supabase/server/student-status.ts`
2. `supabase/server/teacher-status.ts`
3. `supabase/server/equipment-status.ts`
4. `supabase/server/package-status.ts`

**Pattern:**

```typescript
// BEFORE
export async function updateStudentStatus(studentId: string, status: string) {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");
        if (!schoolId) return { success: false, error: "..." };

        const supabase = getServerConnection();
        const { error } = await supabase
            .from("student")
            .update({ status })
            .eq("id", studentId)
            .eq("school_id", schoolId);

        if (error) {
            console.error("Error:", error);
            return { success: false, error: "..." };
        }

        revalidatePath("/students");
        return { success: true };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: "..." };
    }
}

// AFTER
export async function updateStudentStatus(studentId: string, status: string) {
    return updateItem("student", studentId, { status }, "/students");
}
```

---

## Phase 4: ID Getters (Medium-High Impact)

These fetch individual entities by ID with relations. They all follow the same pattern.

**Files:**
1. `supabase/server/student-id.ts` - 204 lines
2. `supabase/server/teacher-id.ts` - 159 lines
3. `supabase/server/booking-id.ts` - Similar pattern
4. `supabase/server/equipment-id.ts` - Similar pattern
5. `supabase/server/package-id.ts` - Similar pattern

**Pattern to Replace:**

```typescript
// BEFORE (200+ lines)
export async function getStudentById(id: string) {
    try {
        const contextResult = await getSchoolContextOrFail();
        if (!contextResult.success) return contextResult;
        const { schoolId } = contextResult.data;

        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("student")
            .select("*, relations(*)")
            .eq("id", id)
            .eq("school_id", schoolId)
            .single();

        if (error) {
            console.error("Error:", error);
            return { success: false, error: "..." };
        }

        // ... 150 lines of transformation ...
        const result = transformData(data);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: "..." };
    }
}

// AFTER (Keep transformation, just improve imports and error handling)
import { handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function getStudentById(id: string) {
    try {
        const contextResult = await getSchoolContextOrFail();
        if (!contextResult.success) return contextResult;
        const { schoolId } = contextResult.data;

        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("student")
            .select("*, relations(*)")
            .eq("id", id)
            .eq("school_id", schoolId)
            .single();

        if (error) {
            return handleSupabaseError(error, "fetch student by id");
        }

        // ... same transformation code ...
        const result = transformData(data);
        logger.info("Fetched student by ID", { studentId: id });
        return { success: true, data: result };
    } catch (error) {
        logger.error("Error fetching student", error);
        return { success: false, error: "..." };
    }
}
```

---

## Phase 5: List Operations (Lower Impact)

These fetch lists of entities. Less duplication but still worth refactoring.

**Files:**
1. `supabase/server/students.ts` - List students
2. `supabase/server/teachers.ts` - List teachers
3. `supabase/server/equipments.ts` - List equipment
4. `supabase/server/bookings.ts` - List bookings (use booking-queries.ts helpers)
5. `supabase/server/packages.ts` - List packages

**Pattern:**

```typescript
// BEFORE
export async function getStudents() {
    try {
        const contextResult = await getSchoolContextOrFail();
        if (!contextResult.success) return contextResult;
        const { schoolId } = contextResult.data;

        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("student")
            .select("*")
            .eq("school_id", schoolId);

        if (error) {
            console.error("Error:", error);
            return { success: false, error: "..." };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: "..." };
    }
}

// AFTER
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";

export async function getStudents() {
    try {
        const contextResult = await getSchoolContextOrFail();
        if (!contextResult.success) return contextResult;
        const { schoolId } = contextResult.data;

        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("student")
            .select("*")
            .eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "fetch students");
        }

        logger.info("Fetched students", { count: safeArray(data).length });
        return { success: true, data: safeArray(data) };
    } catch (error) {
        logger.error("Error fetching students", error);
        return { success: false, error: "..." };
    }
}
```

---

## Phase 6: Booking Operations (Special)

These use complex booking queries. Use the `booking-queries.ts` helpers.

**Files:**
1. `supabase/server/bookings.ts`
2. `supabase/server/classboard.ts` - Uses booking queries
3. `supabase/server/home.ts` - Uses booking queries

**Pattern:**

```typescript
// BEFORE
const { data: bookings } = await supabase.from("booking").select(`
    id, date_start, date_end,
    school_package!inner(...),
    booking_student(...),
    lesson(...)
`);

// AFTER
import { getBookingSelectQuery } from "@/supabase/queries/booking-queries";

const { data: bookings } = await supabase
    .from("booking")
    .select(getBookingSelectQuery());
```

---

## Phase 7: Other Files (Lower Priority)

**Files to update for logger/error handling:**
- `supabase/server/admin.ts`
- `supabase/server/schools.ts`
- `supabase/server/user.ts`
- `supabase/server/welcome.ts`
- `supabase/server/events.ts`
- `supabase/server/notifications.ts`
- `supabase/server/email-service.ts`
- `supabase/server/classboard.ts`
- `supabase/server/home.ts`
- `supabase/server/student-user.ts`
- `supabase/server/teacher-user.ts`
- `supabase/server/student-package.ts`
- `supabase/server/teacher-equipment.ts`
- `supabase/server/cdn.ts`
- `supabase/server/index.ts`
- `supabase/server/subdomain.ts`
- `supabase/server/wizard-entities.ts`

---

## Refactoring Checklist

For each file, follow this checklist:

- [ ] Add imports (getSchoolContextOrFail, handlers, logger, helpers)
- [ ] Replace `headers()` + school context reading with `getSchoolContextOrFail()`
- [ ] Replace `console.error()` with `logger.error()`
- [ ] Replace `console.log()` with `logger.info()` or `logger.debug()`
- [ ] Replace error handling with `handleSupabaseError()`
- [ ] Replace `isUniqueConstraintError()` checks with helper
- [ ] Replace `(data || []).map()` with `safeArray(data).map()`
- [ ] Replace CRUD boilerplate with `createItem()`, `updateItem()`, `deleteItem()`
- [ ] Verify all imports are used
- [ ] Test that the file still works
- [ ] Check git diff for obvious improvements

---

## Expected Impact

**Lines of Code:**
- Register.ts refactored: 530 → 528 lines (2 line reduction - code quality, not size)
- Potential total reduction: 1,080+ lines across all files
- Most impact from CRUD operations (87 → 6 lines per function)

**Code Quality:**
- ✅ Consistent error handling
- ✅ Structured logging
- ✅ Single source of truth for patterns
- ✅ Easier to maintain and extend
- ✅ Fewer bugs from copy-paste errors

---

## Testing

After refactoring each file:

1. **Import check**: Ensure all imports are valid
2. **Type check**: Run TypeScript compiler
3. **Behavior check**: The file should behave identically
4. **Log check**: Error logs should use new structured format

```bash
# Type check all TypeScript
npx tsc --noEmit

# Run tests (if applicable)
npm run test
```

---

## Rollout Strategy

1. **Week 1**: Refactor Phase 2 (CRUD operations) - Biggest impact
2. **Week 2**: Refactor Phase 3-4 (Status + ID getters)
3. **Week 3**: Refactor Phase 5-6 (List + Booking ops)
4. **Week 4**: Refactor Phase 7 (Other files) + Polish

---

## Review & Merge

Once refactoring is complete:

1. Create PR with all refactored files
2. Highlight:
   - Lines saved per file
   - Consistency improvements
   - Error handling improvements
3. Team review
4. Merge to main
5. Deploy with confidence!

---

## Tools & Helpers

All helpers available in:
- `backend/logger.ts` - Structured logging
- `backend/error-handlers.ts` - Error utilities
- `backend/school-context.ts` - School context helpers
- `backend/crud-helpers.ts` - CRUD operations
- `supabase/queries/booking-queries.ts` - Booking queries
- `types/auth-utils.ts` - Auth utilities
- `types/header-constants.ts` - Header names

---

## Questions?

Refer to:
- `docs/DRY_HELPERS_SUMMARY.md` - Quick reference
- `docs/DRY_REFACTORING_EXAMPLES.md` - Before/after examples
- `examples/` - Implementation examples

Good luck! 🚀
