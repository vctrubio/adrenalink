# 🎯 Best Practices Guide - Adrenalink DRY Refactoring

Quick reference for maintaining the refactored codebase standards.

---

## 1. LOGGING - Use Structured Logger

### ✅ DO THIS
```typescript
import { logger } from "@/backend/logger";

// Log with context object
logger.info("Created booking", { bookingId: "123", studentCount: 5 });
logger.error("Failed to fetch teacher", error, { teacherId: "456" });
logger.warn("Missing timezone in context", { schoolId: "789" });
logger.debug("Processing relation", { relationType: "bookings", count: 10 });
```

### ❌ DON'T DO THIS
```typescript
console.log("Creating booking");
console.error("Error fetching:", error);
console.warn("⚠️ Missing timezone");
console.log("done");
```

### Context Object Pattern
- **What to include:** IDs, counts, user-facing info
- **What NOT to include:** Raw error stacks (pass as 2nd param), raw objects
- **Log levels:**
  - `error()` - Failures, exceptions
  - `warn()` - Potential issues
  - `info()` - User-facing operations
  - `debug()` - Development/troubleshooting

---

## 2. ERROR HANDLING - Use Centralized Functions

### ✅ DO THIS
```typescript
import { handleSupabaseError, isUniqueConstraintError, safeArray } from "@/backend/error-handlers";

const { data, error } = await supabase.from("student").select("*");
if (error) {
    return handleSupabaseError(error, "fetch students", "Failed to load students");
}

// Or check specific error type
if (isUniqueConstraintError(error)) {
    return { success: false, error: "Email already exists" };
}

// Safe array access
const items = safeArray(data.items).map(i => i.id);
```

### ❌ DON'T DO THIS
```typescript
if (error?.code === "23505") {
    console.error("Duplicate:", error);
    return { success: false, error: "Duplicate" };
}

const items = (data.items || []).map(i => i.id);
```

### Error Response Format
```typescript
// ALWAYS return this format
type ApiActionResponseModel<T> =
    | { success: true; data: T }
    | { success: false; error: string }

// Usage
if (!result.success) return result; // Pass through errors
const data = result.data; // Type-safe access
```

---

## 3. SERVER ACTIONS - Follow the Template

### ✅ Template for New Server Action

```typescript
"use server";

import { getServerConnection } from "@/supabase/connection";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";
import type { ApiActionResponseModel } from "@/types/actions";

export async function myAction(id: string): Promise<ApiActionResponseModel<any>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("table")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return handleSupabaseError(error, "fetch record", "Failed to load");
        }

        // Use safeArray for any array/relation access
        const items = safeArray(data.relations).map(r => r.id);

        logger.info("Fetched record", { recordId: id, itemCount: items.length });
        return { success: true, data };
    } catch (error) {
        logger.error("Unexpected error", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
```

### Key Points
1. Always use `"use server"` directive
2. Always import: getServerConnection, logger, error-handlers
3. Always return ApiActionResponseModel<T>
4. Always use safeArray() for array access
5. Always log at key points (info for success, debug for processing)
6. Always handle errors with handleSupabaseError()

---

## 4. CONTEXT MANAGEMENT - Use Centralized Functions

### ✅ DO THIS
```typescript
import { getSchoolContextOrFail, getSchoolId, getSchoolTimezone } from "@/backend/school-context";

// Full context
const contextResult = await getSchoolContextOrFail();
if (!contextResult.success) return contextResult;
const { schoolId, timezone } = contextResult.data;

// Or just school ID
const schoolId = await getSchoolId();

// Or just timezone
const timezone = await getSchoolTimezone();
```

### ❌ DON'T DO THIS
```typescript
const headersList = await headers();
let schoolId = headersList.get("x-school-id");

if (!schoolId) {
    const schoolHeader = await getSchoolHeader();
    if (!schoolHeader) {
        return { success: false, error: "School context not found" };
    }
    schoolId = schoolHeader.id;
}
```

---

## 5. NULL SAFETY - Use safeArray()

### ✅ DO THIS
```typescript
import { safeArray } from "@/backend/error-handlers";

const items = safeArray(data.items).filter(i => i.active);
const lessons = safeArray(booking.lessons).map(l => l.id);
const payments = safeArray(relation.payments).reduce((sum, p) => sum + p.amount, 0);
```

### ❌ DON'T DO THIS
```typescript
const items = (data.items || []).filter(i => i.active);
const lessons = booking.lessons?.map(l => l.id) || [];
const payments = (relation.payments || []).reduce(...);
```

### When to Use safeArray
- Any array that might be null/undefined
- Database relation arrays
- API response arrays
- Optional array properties

---

## 6. ADDING NEW ERROR TYPES

### If you need to handle a new error type:

**Step 1:** Add to enum in `backend/error-handlers.ts`
```typescript
export enum SupabaseErrorCode {
    UNIQUE_CONSTRAINT = "23505",
    MY_NEW_ERROR = "CUSTOM_CODE",  // ← Add here
}
```

**Step 2:** Add detection function
```typescript
export function isMyNewError(error: any): boolean {
    if (!error) return false;
    return error.code === SupabaseErrorCode.MY_NEW_ERROR;
}
```

**Step 3:** Update handleSupabaseError()
```typescript
if (isMyNewError(error)) {
    return {
        success: false,
        error: "User-friendly message"
    };
}
```

**Step 4:** Done - use across all files
```typescript
if (isMyNewError(error)) {
    return { success: false, error: "My error" };
}
```

---

## 7. CHANGING LOG FORMAT

If you need to change how logs are formatted:

**Edit ONE file:** `backend/logger.ts`

The formatMessage() function controls all log output. All 33+ files automatically use the new format.

---

## 8. TESTING CHECKLIST FOR NEW CODE

Before committing new server actions:

- [ ] Uses logger for all operations
- [ ] Uses handleSupabaseError for all DB errors
- [ ] Uses safeArray for all array access
- [ ] Returns ApiActionResponseModel<T>
- [ ] No console.* calls
- [ ] No emoji prefixes
- [ ] Try/catch wraps entire function
- [ ] Context objects include useful info
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors

---

## 9. PATTERNS TO AVOID

### ❌ Scattered Logging
```typescript
console.log("x");
console.error("y");
console.warn("z");
```
Use `logger.info()`, `logger.error()`, `logger.warn()` instead

### ❌ Magic Error Codes
```typescript
if (error?.code === "23505") { ... }
```
Use `isUniqueConstraintError(error)` instead

### ❌ Inline Context Getting
```typescript
const headersList = await headers();
const schoolId = headersList.get("x-school-id");
```
Use `await getSchoolId()` instead

### ❌ Unsafe Array Access
```typescript
const items = (data.items || []).map(...);
const lessons = relation.lessons?.map(...);
```
Use `safeArray(data.items).map(...)` instead

### ❌ Inconsistent Error Response
```typescript
return { success: false, error: "msg" }; // ✅ Good
return { error: "msg" }; // ❌ Bad
return null; // ❌ Bad
throw new Error("msg"); // ❌ Bad in server actions
```

### ❌ Missing Context in Logs
```typescript
logger.info("Done"); // ❌ Not helpful
logger.info("Created item", { id, count }); // ✅ Useful
```

---

## 10. COMMON ISSUES & SOLUTIONS

### Issue: "logger is not defined"
**Solution:** Add import
```typescript
import { logger } from "@/backend/logger";
```

### Issue: "handleSupabaseError is not a function"
**Solution:** Add import
```typescript
import { handleSupabaseError } from "@/backend/error-handlers";
```

### Issue: "Cannot read property 'map' of undefined"
**Solution:** Use safeArray
```typescript
const items = safeArray(data.items).map(...);
```

### Issue: "Cannot get schoolId from header"
**Solution:** Use getSchoolId()
```typescript
const schoolId = await getSchoolId();
```

### Issue: Build fails with TypeScript error
**Solution:** Check that return type is ApiActionResponseModel<T>
```typescript
export async function myAction(): Promise<ApiActionResponseModel<string>> {
    return { success: true, data: "result" };
}
```

---

## 11. IMPORTS QUICK REFERENCE

### Logging
```typescript
import { logger } from "@/backend/logger";
```

### Error Handling
```typescript
import {
    handleSupabaseError,
    safeArray,
    isUniqueConstraintError,
    isForeignKeyError,
    isNotFoundError,
    isUnauthorizedError,
    withErrorHandling,
    assertExists
} from "@/backend/error-handlers";
```

### Context Management
```typescript
import {
    getSchoolContext,
    getSchoolContextOrFail,
    getSchoolId,
    getSchoolTimezone
} from "@/backend/school-context";
```

### Server Connection
```typescript
import { getServerConnection } from "@/supabase/connection";
```

### Types
```typescript
import type { ApiActionResponseModel } from "@/types/actions";
```

---

## 12. FILE ORGANIZATION

### Where to put what:

**`supabase/server/*.ts`** - Server actions
- Database operations
- Error handling
- Logging

**`backend/*.ts`** - Utilities & helpers
- Logging functions (logger.ts)
- Error classification (error-handlers.ts)
- Context retrieval (school-context.ts)

**`getters/*.ts`** - Pure functions
- Data transformation
- Business logic
- Calculations

**`hooks/*.ts`** - React hooks
- State management
- Side effects

**`src/components/*.tsx`** - UI components
- Only rendering
- Props from parent
- Logic in child components

---

## 13. BEFORE YOU COMMIT

Run this checklist:

```bash
# 1. Build passes
npm run build

# 2. No console calls
grep -n "console\." supabase/server/your-new-file.ts

# 3. Uses logger
grep -n "logger\." supabase/server/your-new-file.ts

# 4. Has error handling
grep -n "handleSupabaseError" supabase/server/your-new-file.ts

# 5. Uses safeArray
grep -n "safeArray" supabase/server/your-new-file.ts

# 6. Clean git status
git status
```

---

## 14. MONITORING & DEBUGGING

### Production Monitoring
Because logs are structured with context objects, you can:
- Parse logs as JSON
- Filter by schoolId
- Group by operation type
- Alert on error patterns
- Track performance

Example structured log:
```json
{
  "level": "error",
  "message": "Database error: fetch students",
  "timestamp": "2025-01-16T10:30:00Z",
  "context": {
    "schoolId": "school-123",
    "error": {
      "code": "23505",
      "message": "unique constraint violation"
    }
  }
}
```

### Development Debugging
All errors automatically logged with context - check logs for:
- What operation failed
- What school/entity was involved
- What the error actually was
- When it happened

---

## Summary: The 4 Pillars

1. **Logger** - All logging goes through `logger.*`
2. **Error Handlers** - All errors checked with `isXxxError()` or `handleSupabaseError()`
3. **Safe Arrays** - All arrays access through `safeArray()`
4. **Context** - All context from `getSchoolXxx()` functions

Follow these 4 patterns in every new server action, and the codebase stays clean and maintainable.

---

**Keep the codebase DRY. Keep it clean. Keep it consistent.** 🎯
