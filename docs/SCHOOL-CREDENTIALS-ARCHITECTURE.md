# School Credentials System Architecture

## Overview

This document describes how school credentials (logo, currency, username, status, ownerId) are fetched, cached, and provided to the application through a unified provider/hook pattern.

## Architecture Flow

```
Proxy (subdomain routing)
    ↓
x-school-username header
    ↓
Layout: getSchoolCredentials()
    ↓
SchoolCredentialsProvider (context)
    ↓
useSchoolCredentials() hook
    ↓
Client Components (NavLeft, etc.)
```

## Key Components

### 1. **Types** (`types/credentials.ts`)

Centralized type definition for school credentials:

```typescript
interface SchoolCredentials {
    logo: string | null;              // URL to school logo from R2
    currency: string;                 // USD, EUR, CHF
    username: string;                 // School identifier
    status: string;                   // active, pending, closed
    ownerId: string;                  // UUID of school owner
}
```

### 2. **Header Context** (`types/headers.ts`)

The proxy sets the `x-school-username` header based on the subdomain. This header is used throughout the app to identify which school is making the request.

```typescript
// Example: kite-tarifa.adrenalink.local
// → x-school-username: kite-tarifa
```

### 3. **Layout Data Fetching** (`src/app/(admin)/layout.tsx`)

The layout component fetches credentials once at page load:

```typescript
async function getSchoolCredentials(): Promise<SchoolCredentials | null> {
    const headersList = await headers();
    const schoolUsername = headersList.get("x-school-username");
    
    // 1. Fetch school data from database
    const schoolData = await db.query.school.findFirst({
        where: eq(school.username, schoolUsername),
    });
    
    // 2. Fetch logo from R2 (tries school-specific, then admin fallback)
    const logoUrl = await fetchLogoUrl(schoolUsername);
    
    // 3. Return complete credentials object
    return {
        logo: logoUrl,
        currency: schoolData.currency,
        username: schoolData.username,
        status: schoolData.status,
        ownerId: schoolData.ownerId,
    };
}
```

**Key Features:**
- Server-side execution (secure, no client exposure)
- Runs once per page load
- Uses `headers()` to get subdomain context from proxy
- Fetches from both database and R2 storage

### 4. **Provider** (`src/providers/school-credentials-provider.tsx`)

Context provider that makes credentials available to all child components:

```typescript
export function SchoolCredentialsProvider({
    credentials,
    children,
}: SchoolCredentialsProviderProps) {
    return (
        <SchoolCredentialsContext.Provider value={{ credentials }}>
            {children}
        </SchoolCredentialsContext.Provider>
    );
}
```

**Usage in layout:**
```typescript
<SchoolCredentialsProvider credentials={credentials}>
    <FacebookNav />
    {/* All children can access via hook */}
</SchoolCredentialsProvider>
```

### 5. **Hook** (`src/providers/school-credentials-provider.tsx`)

Client-side hook to access credentials in any component:

```typescript
export function useSchoolCredentials(): SchoolCredentials | null {
    const context = useContext(SchoolCredentialsContext);
    return context?.credentials ?? null;
}
```

**Usage in components:**
```typescript
export const NavLeft = () => {
    const credentials = useSchoolCredentials();
    const logoUrl = credentials?.logo || null;
    const schoolUsername = credentials?.username || null;
    // ...
}
```

### 6. **API Route** (`src/app/api/school/credentials/route.ts`)

Optional HTTP endpoint for client-side fetching (useful for client-only contexts):

```typescript
GET /api/school/credentials
```

Returns credentials with 12-hour cache headers.

## Data Flow Diagram

```
1. Page Request
   ├─ Proxy sets x-school-username header
   └─ Next.js routes to Layout

2. **Layout Execution (Server)**
   ├─ Calls getSchoolCredentials()
   ├─ Reads x-school-username from headers()
   ├─ Fetches school from database (cached 12 hours)
   ├─ Fetches logo from R2
   └─ Returns SchoolCredentials object

3. Provider Setup
   ├─ SchoolCredentialsProvider wraps tree
   └─ Credentials available via context

4. Component Access (Client)
   ├─ useSchoolCredentials() hook
   ├─ Accesses context value
   └─ Renders logo, currency, etc.
```

## Caching Strategy

### Server-Side (Next.js)
- Layout fetches run with 12-hour revalidation
- Credentials cached by school username
- Revalidate via API route cache headers

### Client-Side (Optional Hook)
- `useSchoolCredentials()` hook in provider (not a separate hooks file)
- Accesses context value set by server-side data
- No client-side API calls needed for initial data

### R2/Database
- Database query cached via `unstable_cache`
- R2 logo check via `HeadObjectCommand` (fast object existence check)
- Logo URL built dynamically, no storage needed

## Logo Resolution Flow

The system tries logos in this order:

1. **School-specific logo**: `{schoolUsername}/icon.png` in R2
2. **Admin fallback**: `admin/icon.png` in R2
3. **No logo**: Returns `null`, renders Adranlink icon

Example for school "kite-tarifa":
```
Try: kite-tarifa/icon.png
├─ Success → return URL
└─ Fail → Try: admin/icon.png
    ├─ Success → return URL
    └─ Fail → return null
```

## Performance Considerations

### No Flash/Blinking
- Credentials fetched server-side before render
- Provider passes data as prop (no loading state)
- Logo available immediately on first paint

### Efficient Database Access
- One query per school per 12 hours
- Uses `unstable_cache` with tags for revalidation
- Connection pooling via Drizzle ORM

### Efficient R2 Access
- Uses `HeadObjectCommand` (no data transfer)
- Only checks if object exists
- Two requests max (school logo + admin fallback)

## Adding New Credentials

To add a new field to school credentials:

1. **Update schema** in `drizzle/schema.ts`
2. **Update type** in `types/credentials.ts`
3. **Update fetch** in layout's `getSchoolCredentials()`
4. **Update API route** if needed for client access
5. **Use in components** via `useSchoolCredentials()`

Example:

```typescript
// types/credentials.ts
export interface SchoolCredentials {
    // ... existing fields
    phoneNumber: string;  // NEW
}

// src/app/(admin)/layout.tsx
const logoUrl = await fetchLogoUrl(schoolUsername);
return {
    // ... existing fields
    phoneNumber: schoolData.phoneNumber,
};
```

## Security

- **Server-side fetching**: Credentials never exposed to client code
- **Header validation**: Proxy validates subdomain → header
- **No client-side API calls**: Provider ensures single source of truth
- **Type-safe**: TypeScript ensures correct credential shape

## Troubleshooting

### Logo not showing
- Check R2 bucket has `{schoolUsername}/icon.png` or `admin/icon.png`
- Verify R2 credentials in `.env.local`
- Check public URL in `CLOUDFLARE_R2_PUBLIC_URL`

### Credentials undefined in component
- Ensure component is wrapped by `SchoolCredentialsProvider`
- Check provider is rendering in layout above component
- Verify component uses "use client" directive

### Stale credentials
- Clear cache: `revalidateTag("school-data")` or `revalidateTag("school-logo")`
- Manually invalidate in admin panel if available
- Wait 12 hours for auto-revalidation

## Related Files

- `types/credentials.ts` - Type definitions
- `types/headers.ts` - Header context utilities
- `src/providers/school-credentials-provider.tsx` - Provider + hook implementation
- `src/app/(admin)/layout.tsx` - Server-side data fetching
- `src/app/api/school/credentials/route.ts` - API endpoint (optional, for client-side fetching)
- `src/components/navigations/facebook/NavLeft.tsx` - Example usage
