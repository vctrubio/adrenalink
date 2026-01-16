# Authentication Flags Guide

Disable auth restrictions for development and testing while maintaining production security.

## Overview

Adrenalink supports environment flags to toggle authentication on/off. This allows developers to:

✅ Test the app without Clerk setup
✅ Test different user roles easily
✅ Facilitate features without auth restrictions
✅ Switch to production auth with one flag change

---

## Quick Start

### 1. Create `.env.local` in project root

```bash
# Copy the example
cp .env.local.example .env.local
```

### 2. For Development (Auth Disabled)

```env
# Development: disable auth to test freely
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=admin
NEXT_PUBLIC_DEFAULT_USER_ID=dev-user-123
NEXT_PUBLIC_DEFAULT_SCHOOL_ID=school_001
```

Run the app:
```bash
npm run dev
```

Access any route without authentication:
- Admin routes: `http://localhost:3000/app/(admin)/home` ✅
- User routes: `http://localhost:3000/app/(users)/teacher/123` ✅
- All routes work without logging in!

### 3. For Production (Auth Enabled)

```env
# Production: enable auth with Clerk
NEXT_PUBLIC_DISABLE_AUTH=false
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

When deployed to production, all routes require Clerk authentication.

---

## Environment Variables

### Main Flag

| Variable | Values | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_DISABLE_AUTH` | `true` / `false` | Enable/disable auth checks |

**Default:** `false` (auth enabled)

### Development Defaults (when auth disabled)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_DEFAULT_ROLE` | `admin` | Mock user role (admin/teacher/student) |
| `NEXT_PUBLIC_DEFAULT_USER_ID` | `dev-user` | Mock user ID |
| `NEXT_PUBLIC_DEFAULT_SCHOOL_ID` | `school_001` | Mock school ID |

---

## Usage Scenarios

### Scenario 1: Test Admin Features

**Goal:** Test admin-only features without Clerk

**.env.local:**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=admin
```

**What happens:**
- All `/app/(admin)/*` routes are accessible
- User is "Admin User" from dev@dev.local
- No login required

---

### Scenario 2: Test Teacher Features

**Goal:** Test teacher portal without Clerk

**.env.local:**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=teacher
```

**What happens:**
- All `/app/(users)/teacher/*` routes are accessible
- User is "Teacher User" from teacher@dev.local
- No login required

---

### Scenario 3: Test Student Features

**Goal:** Test student portal without Clerk

**.env.local:**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=student
```

**What happens:**
- All `/app/(users)/student/*` routes are accessible
- User is "Student User" from student@dev.local
- No login required

---

### Scenario 4: Full Stack Testing

**Goal:** Test with full authentication (production-like)

**.env.local:**
```env
NEXT_PUBLIC_DISABLE_AUTH=false
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**What happens:**
- All routes require Clerk login
- Users must authenticate before accessing protected routes
- Production-like behavior

---

## How It Works

### Data Flow with Auth Disabled

```
Request → proxy.ts
  ├─ Detect subdomain
  └─ Set school headers
      ↓
Layout (e.g., /app/(admin)/layout.tsx)
  ├─ Call getUserSchoolContext()
  ├─ Check isAuthDisabledMode()
  │  └─ If true: Skip guards, return fully authorized
  └─ If false: Enforce normal auth
      ↓
Child Pages
  └─ Full access to all routes
```

### Code Flow

```typescript
// In layout:
if (isAuthDisabledMode()) {
    // NEXT_PUBLIC_DISABLE_AUTH=true
    // Return page without auth checks
    return <div>{children}</div>;
}

// NEXT_PUBLIC_DISABLE_AUTH=false
// Check authentication normally
if (!context.isAuthorized) {
    redirect("/unauthorized");
}
```

---

## Implementation Details

### Files Involved

1. **`types/auth-flags.ts`** - Flag utilities
   - `isAuthDisabled()` - Check if auth is disabled
   - `getDefaultRole()` - Get default role
   - `getDefaultUserId()` - Get default user ID
   - `getDefaultSchoolId()` - Get default school ID
   - `getMockUserForRole(role)` - Create mock user

2. **`types/user-school-provider.ts`** - Updated to support flags
   - `getCurrentUser()` - Uses mock user if auth disabled
   - `getUserSchoolContext()` - Skips validation if auth disabled
   - `isAuthDisabledMode()` - Export from auth-flags

3. **`src/proxy.ts`** - Middleware (no changes needed)
   - Already sets school headers
   - Works with both auth enabled/disabled

4. **`.env.local.example`** - Configuration template
   - Shows all available flags
   - Includes examples for different scenarios

### When Auth is Disabled

```typescript
// user-school-provider.ts - getUserSchoolContext()

if (isAuthDisabled()) {
    // Skip all validation
    const user = getMockUserForRole(getDefaultRole());
    const school = MOCK_SCHOOLS[getDefaultSchoolId()];

    return {
        user,
        school,
        isAuthorized: true,  // Always authorized
        // error omitted - no error
    };
}

// Normal auth flow...
```

### When Auth is Enabled

```typescript
// Normal Clerk auth flow
if (isAuthDisabled()) {
    // Skipped
}

// Validate user
if (!user) return { isAuthorized: false };

// Validate school membership
if (!validateUserSchoolRelation(user.id, schoolId)) {
    return { isAuthorized: false };
}

// Success
return { isAuthorized: true };
```

---

## Layout Integration

### Simple Pattern

```typescript
import { isAuthDisabledMode } from "@/types/user-school-provider";

export default async function AdminLayout({ children }) {
    const context = await getUserSchoolContext();

    // Skip guards if auth is disabled
    if (isAuthDisabledMode()) {
        return <div>{children}</div>;
    }

    // Enforce guards normally
    if (!context.isAuthorized || !isSchoolAdmin(context)) {
        redirect("/forbidden");
    }

    return <div>{children}</div>;
}
```

### With Visual Indicator

```typescript
export default async function AdminLayout({ children }) {
    const context = await getUserSchoolContext();

    if (isAuthDisabledMode()) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-yellow-500/20 p-4">
                    <span className="font-bold text-yellow-600">
                        ⚠️ DEV MODE: Auth is disabled
                    </span>
                </header>
                <main>{children}</main>
            </div>
        );
    }

    // Normal layout...
}
```

---

## Testing Different Roles

### Batch Test All Roles

Create multiple `.env.local` configurations:

**dev.admin.env:**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=admin
```

**dev.teacher.env:**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=teacher
```

**dev.student.env:**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=student
```

Load each when testing:
```bash
# Test admin
export $(cat dev.admin.env) && npm run dev

# Test teacher
export $(cat dev.teacher.env) && npm run dev

# Test student
export $(cat dev.student.env) && npm run dev
```

---

## Security Notes

### ⚠️ Critical Security Rules

1. **NEVER commit `NEXT_PUBLIC_DISABLE_AUTH=true` to Git**
   ```bash
   # Add to .gitignore
   echo ".env.local" >> .gitignore
   echo ".env.*.local" >> .gitignore
   ```

2. **Always disable in production**
   ```env
   # Production (never change this)
   NEXT_PUBLIC_DISABLE_AUTH=false
   ```

3. **Only use in development**
   - The code checks `NODE_ENV === "development"`
   - Production deployments enforce auth regardless

4. **Inform your team**
   - Ensure all devs understand the flags
   - Prevent accidental production issues

### How It's Protected

```typescript
// auth-flags.ts
export function isDevelopmentWithAuthDisabled(): boolean {
    const isDev = process.env.NODE_ENV === "development";
    const authDisabled = isAuthDisabled();

    if (authDisabled && !isDev) {
        // ⚠️ Security warning if not in development
        console.warn("SECURITY WARNING: Auth disabled outside of development!");
    }

    return isDev && authDisabled;
}
```

---

## Troubleshooting

### Issue: Routes still require login when auth is disabled

**Check:**
1. Is `NEXT_PUBLIC_DISABLE_AUTH=true` set?
2. Did you restart the dev server after changing `.env.local`?
3. Check browser console for errors

**Solution:**
```bash
# Restart dev server
npm run dev
```

### Issue: Wrong role being used

**Check:**
- `NEXT_PUBLIC_DEFAULT_ROLE` is set to desired role
- Value is "admin", "teacher", or "student"

**Solution:**
```env
NEXT_PUBLIC_DEFAULT_ROLE=admin  # Not "school_admin"!
```

### Issue: Cannot access subdomain-specific data

**Check:**
- `NEXT_PUBLIC_DEFAULT_SCHOOL_ID` is set
- School exists in `MOCK_SCHOOLS` in `types/user.ts`

**Solution:**
```env
NEXT_PUBLIC_DEFAULT_SCHOOL_ID=school_001
```

---

## Migration to Clerk

When Clerk is ready:

1. **Keep auth flags in place**
   ```typescript
   // They still work! Just set flag to false
   NEXT_PUBLIC_DISABLE_AUTH=false
   ```

2. **Add Clerk environment variables**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

3. **Update getCurrentUser() in user-school-provider.ts**
   ```typescript
   async function getCurrentUser() {
       if (isAuthDisabled()) {
           return getMockUserForRole(...);
       }

       // Clerk integration
       const { userId } = await auth();
       if (!userId) return null;
       // Get Clerk user data...
   }
   ```

4. **Everything else works unchanged!**
   - Layouts still use same guard pattern
   - Server actions still use same context
   - No breaking changes

---

## Examples in Action

### Before & After

**Without flags (old approach):**
```typescript
// Have to set x-user-id header manually
curl -H "x-user-id: user_admin_001" http://localhost:3000/
```

**With flags (new approach):**
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=admin
```
```bash
# Just run - all routes work!
npm run dev
```

---

## Summary

| Feature | Disabled | Enabled |
|---------|----------|---------|
| **Auth checks** | Skipped | Enforced |
| **User context** | Mock (from role) | Clerk |
| **Route access** | Full access | Restricted by role |
| **Production use** | ❌ NO | ✅ YES |
| **Development use** | ✅ YES | ✅ YES |

---

## Files to Review

- `types/auth-flags.ts` - Flag utilities
- `types/user-school-provider.ts` - Updated provider (lines 17-23, 35-37, 113-131)
- `.env.local.example` - Configuration template
- `examples/ADMIN_LAYOUT_WITH_FLAGS.tsx` - Layout implementation

---

## Quick Reference

```bash
# Development (auth disabled)
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=admin

# Production (auth enabled)
NEXT_PUBLIC_DISABLE_AUTH=false

# Switch roles quickly
NEXT_PUBLIC_DEFAULT_ROLE=teacher
NEXT_PUBLIC_DEFAULT_ROLE=student
NEXT_PUBLIC_DEFAULT_ROLE=admin
```

That's it! Enjoy frictionless development! 🚀
