# Clerk Authentication Integration Guide

## Overview

This document describes the implementation of user authentication with role-based routing in Adrenalink. The system uses a DRY "user-school-provider" pattern that combines school context (from subdomain) with user authentication.

## Architecture

```
REQUEST
  ↓
[proxy.ts] Middleware
  ├─ Detect school from subdomain
  ├─ Lookup school in database
  ├─ Get user from request (mock/Clerk)
  ├─ Validate user belongs to school
  └─ Inject headers (x-school-*, x-user-*)
  ↓
[Layout/Server Component]
  ├─ Call getUserSchoolContext()
  ├─ Check isAuthorized
  └─ Route based on role
  ↓
[APP]
  (admin)  ← school_admin role
  (users)/teacher ← teacher role
  (users)/student ← student role
```

## Key Files

### 1. `types/user.ts`
Defines user types and mock data:
- `UserRole` - 'school_admin' | 'teacher' | 'student'
- `UserAuth` - User object structure
- `MOCK_USERS` - Mock user database
- `MOCK_USER_SCHOOL_RELATIONS` - User-school membership

### 2. `types/user-school-provider.ts` ⭐ (Main Provider)
**THE MOST IMPORTANT FILE** - Single source of truth for all auth context.

```typescript
// Get combined user-school context
const context = await getUserSchoolContext();

if (!context.isAuthorized) {
  redirect("/unauthorized");
}

// Use the context
const userId = context.user.id;
const schoolId = context.school.id;
const userRole = context.user.role;
```

**Helper functions:**
- `getUserSchoolContext()` - Main provider (memoized per request)
- `getUserContext()` - Just the user
- `getSchoolHeader()` - Just the school
- `hasRole(context, role)` - Check if user has role
- `isSchoolAdmin(context)` - Check if admin
- `isTeacher(context)` - Check if teacher
- `isStudent(context)` - Check if student

### 3. `types/header-constants.ts`
Centralized header names (DRY):

```typescript
HEADER_KEYS.SCHOOL_ID        // x-school-id
HEADER_KEYS.SCHOOL_USERNAME  // x-school-username
HEADER_KEYS.USER_ID          // x-user-id
HEADER_KEYS.USER_ROLE        // x-user-role
// etc...
```

### 4. `types/auth-utils.ts`
Middleware helpers (used by proxy.ts):

```typescript
getCurrentUserFromRequest(request)      // Extract user from request
validateUserSchoolAccess(userId, schoolId)  // Check membership
injectUserHeaders(response, user, isAuthorized)  // Set headers
isPublicPath(pathname)                  // Check if route needs auth
```

### 5. `src/proxy.ts` (Updated)
Middleware that:
- Detects subdomain → gets school
- Gets user (mock/Clerk) → injects headers
- Validates user belongs to school
- Logs all operations for debugging

**Key improvements:**
- ✅ DRY: Extracted `constructDiscoverUrl()` helper
- ✅ DRY: Extracted `injectSchoolHeaders()` helper
- ✅ New: User auth checking
- ✅ New: User header injection
- ✅ Cleaner: Uses `isPublicPath()` for asset checks

## Usage Examples

### Example 1: Admin Layout Guard

```typescript
// src/app/(admin)/layout.tsx
import { getUserSchoolContext, isSchoolAdmin } from "@/types/user-school-provider";

export default async function AdminLayout({ children }) {
    const context = await getUserSchoolContext();

    // Check authorization
    if (!context.isAuthorized) {
        redirect("/unauthorized");
    }

    if (!isSchoolAdmin(context)) {
        redirect("/forbidden");
    }

    return (
        <div>
            <h1>Admin Portal - {context.school.username}</h1>
            <p>Welcome, {context.user.firstName}</p>
            {children}
        </div>
    );
}
```

### Example 2: User Portal Layout

```typescript
// src/app/(users)/layout.tsx
import { getUserSchoolContext, hasRole } from "@/types/user-school-provider";

export default async function UserLayout({ children }) {
    const context = await getUserSchoolContext();

    if (!context.isAuthorized) {
        redirect("/unauthorized");
    }

    if (!hasRole(context, ["teacher", "student"])) {
        redirect("/forbidden");
    }

    return (
        <div>
            <nav>Portal for {context.user.firstName}</nav>
            {children}
        </div>
    );
}
```

### Example 3: Server Action with Auth Context

```typescript
// supabase/server/admin.ts
import { getUserSchoolContext } from "@/types/user-school-provider";

export async function getSchoolData() {
    const context = await getUserSchoolContext();

    if (!context.isAuthorized || !isSchoolAdmin(context)) {
        return { success: false, error: "Unauthorized" };
    }

    // Now fetch school data scoped to this school
    const supabase = getServerConnection();
    const { data } = await supabase
        .from("school")
        .select("*")
        .eq("id", context.school.id);

    return { success: true, data };
}
```

### Example 4: Testing with Mock User

For development/testing, set the `x-user-id` header:

```bash
# Test as admin
curl -H "x-user-id: user_admin_001" http://school.lvh.me:3000/

# Test as teacher
curl -H "x-user-id: user_teacher_001" http://school.lvh.me:3000/

# Test as student
curl -H "x-user-id: user_student_001" http://school.lvh.me:3000/
```

## Migration Path: Mock → Clerk

### Phase 1: Current (Mock Data) ✓
Uses `MOCK_USERS` dictionary for testing.

### Phase 2: Clerk Integration
When Clerk is ready, update `types/auth-utils.ts`:

```typescript
// BEFORE (Mock)
export function getCurrentUserFromRequest(request: NextRequest): UserAuth | null {
    const userId = request.headers.get("x-user-id");
    if (userId && MOCK_USERS[userId]) {
        return MOCK_USERS[userId];
    }
    return null;
}

// AFTER (Clerk)
export async function getCurrentUserFromRequest(request: NextRequest): Promise<UserAuth | null> {
    const { userId } = await auth();  // From @clerk/nextjs
    if (!userId) return null;

    const user = await clerkClient.users.getUser(userId);
    return {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.publicMetadata.role as UserRole,
        schoolId: user.publicMetadata.schoolId as string,
    };
}
```

Then run Clerk webhook to sync users to Supabase on signup.

## Data Flow

```
1. Request comes in
   ↓
2. proxy.ts middleware
   ├─ Detect subdomain (school context)
   ├─ Get user from x-user-id header (mock/Clerk later)
   ├─ Validate user→school relation
   └─ Inject headers
   ↓
3. Layout/Component calls getUserSchoolContext()
   ├─ Reads headers (x-school-id, x-user-id, etc.)
   ├─ Returns UserSchoolContext object
   └─ Can cache per-request
   ↓
4. Component checks context.isAuthorized
   ├─ If false → redirect to /unauthorized
   └─ If true → render content
   ↓
5. Server actions have headers available
   ├─ Can read via headers().get("x-school-id")
   ├─ Or call getUserSchoolContext() for full object
   └─ All queries scoped by school_id
```

## Testing Checklist

- [ ] Test as admin - can access (admin) routes
- [ ] Test as teacher - can access (users)/teacher routes
- [ ] Test as student - can access (users)/student routes
- [ ] Test unauthorized user - redirected to /unauthorized
- [ ] Test no user - can access public pages
- [ ] Test wrong school - validated and logged
- [ ] Verify headers are set correctly in requests
- [ ] Check console logs in proxy.ts for debugging

## Key Design Principles

### 1. DRY (Don't Repeat Yourself)
- ✅ Single `getUserSchoolContext()` function
- ✅ Single `injectSchoolHeaders()` helper
- ✅ Centralized header constants
- ✅ No duplicate validation logic

### 2. Per-Request Memoization
```typescript
export const getUserSchoolContext = cache(async () => { ... })
```
- Single DB lookup per request (via `cache()`)
- Same result across the request lifecycle
- Efficient for multiple components

### 3. Graceful Error Handling
```typescript
if (!context.isAuthorized) {
    return { error: "User not authorized" }
}
```
- No exceptions thrown
- Clear error messages
- Allows selective error handling

### 4. Type Safety
```typescript
type UserRole = "school_admin" | "teacher" | "student"
interface UserSchoolContext { ... }
```
- Full TypeScript support
- IDE autocomplete
- No runtime errors

## FAQ

**Q: How do I add a new user role?**
A: Add to `UserRole` type, add mock user to `MOCK_USERS`, add relation to `MOCK_USER_SCHOOL_RELATIONS`.

**Q: What happens if user auth fails?**
A: Context returns `isAuthorized: false`, layouts redirect to `/unauthorized`.

**Q: How do I get school context in server actions?**
A: Call `const context = await getUserSchoolContext()` or read headers directly.

**Q: Can I use this with existing header patterns?**
A: Yes! `getSchoolHeader()` mirrors the existing API in `types/headers.ts`.

**Q: When should I switch from mock to Clerk?**
A: Update `getCurrentUserFromRequest()` in `types/auth-utils.ts` when Clerk is installed.
