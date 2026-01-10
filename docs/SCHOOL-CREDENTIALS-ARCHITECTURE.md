# School Credentials System Architecture

## Overview

This document describes the unified school credentials fetching system. School credentials (logo, currency, username, status, etc.) are fetched once server-side and cached at request-level, then provided to components via a provider/hook pattern for reuse without duplication.

## Architecture Flow

```
Proxy (sets x-school-username header)
    ↓
getSchoolHeader() in types/headers.ts
    ├─ Reads x-school-username from headers
    ├─ Queries Supabase for school data
    └─ Returns cached SchoolCredentials
    ↓
Layout: Fetches credentials via getSchoolHeader()
    ↓
SchoolCredentialsProvider (memoizes via cache())
    ↓
useSchoolCredentials() hook (client components)
    OR
Server-side direct import (pages, components)
    ↓
Components/Pages use credentials (logo, currency, etc.)
```

## Key Components

### 1. **Types** (`types/credentials.ts`)

Centralized type definition for all school data:

```typescript
interface SchoolCredentials {
    id: string;
    logoUrl: string | null; // URL to school logo from CDN
    bannerUrl: string | null; // URL to school banner from CDN
    currency: string; // USD, EUR, CHF
    name: string; // School display name
    username: string; // School identifier/subdomain
    status: string; // active, pending, closed
    ownerId: string; // UUID of school owner
    country: string; // School country
    timezone: string | null; // School timezone
}
```

### 2. **Centralized Fetching** (`types/headers.ts`)

Single source of truth for credential fetching with request-level caching:

```typescript
export const getSchoolHeader = cache(async (): Promise<SchoolCredentials | null> => {
    const headersList = await headers();
    // Support both header keys: x-school-username (subdomains) and username (auth routes)
    const username = headersList.get("x-school-username") || headersList.get("username");

    if (!username) {
        return null;
    }

    try {
        const supabase = getServerConnection();
        const { data: schoolData } = await supabase.from("school").select("*").eq("username", username).single();

        if (!schoolData) {
            return null;
        }

        return {
            id: schoolData.id,
            logoUrl: schoolData.logoUrl || null,
            bannerUrl: schoolData.bannerUrl || null,
            currency: schoolData.currency,
            name: schoolData.name,
            username: schoolData.username,
            status: schoolData.status,
            ownerId: schoolData.ownerId,
            country: schoolData.country,
            timezone: schoolData.timezone,
        };
    } catch (error) {
        return null;
    }
});
```

**Key Features:**

- **Single function** handles all credential fetching
- **React cache()** ensures no duplicate DB hits per request
- **Supports both header keys** for subdomain and auth routes
- **Server-side only** - secure, no client exposure
- **Centralized in types/** - easy to maintain

### 3. **Layout Usage** (`src/app/(admin)/layout.tsx`)

Layouts fetch credentials once and provide via context:

```typescript
import { cache } from "react";
import { getSchoolCredentials as getSchoolCredentialsFromSupabase }
    from "@/supabase/server/admin";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";

// Additional cache() wrapper for redundant safety
const getSchoolCredentials = cache(getSchoolCredentialsFromSupabase);

export default async function AdminLayout({ children }) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            <SchoolTeachersProvider>
                {/* Children can use hook or have credentials passed as props */}
                {children}
            </SchoolTeachersProvider>
        </SchoolCredentialsProvider>
    );
}
```

### 4. **Provider** (`src/providers/school-credentials-provider.tsx`)

Makes credentials available to child components via context:

```typescript
export function SchoolCredentialsProvider({
    credentials,
    children,
}: SchoolCredentialsProviderProps) {
    useEffect(() => {
        if (!credentials) {
            router.push("/no-credentials");
        }
    }, [credentials, router]);

    if (!credentials) {
        return null;
    }

    return (
        <SchoolCredentialsContext.Provider value={{ credentials }}>
            {children}
        </SchoolCredentialsContext.Provider>
    );
}
```

### 5. **Hook** (`src/providers/school-credentials-provider.tsx`)

Client-side hook to access credentials in any component:

```typescript
export function useSchoolCredentials(): SchoolCredentials {
    const context = useContext(SchoolCredentialsContext);
    if (context === undefined) {
        throw new Error("useSchoolCredentials must be used within SchoolCredentialsProvider");
    }
    return context.credentials;
}
```

**Usage in client components:**

```typescript
"use client";

export const NavLeft = () => {
    const credentials = useSchoolCredentials();
    return (
        <div>
            <img src={credentials.logoUrl} />
            <h1>{credentials.name}</h1>
            <p>Currency: {credentials.currency}</p>
        </div>
    );
}
```

### 6. **Server-side Usage** (pages, server components)

Can import directly in server components without provider:

```typescript
import { getSchoolHeader } from "@/types/headers";

export default async function ExamplePage() {
    const credentials = await getSchoolHeader();

    return (
        <div>
            <h1>{credentials.name}</h1>
            <SubDomainHomePage credentials={credentials} />
        </div>
    );
}
```

## Data Flow Diagram

```
1. Request arrives
   ├─ Proxy validates subdomain against database
   └─ Sets x-school-username header

2. Layout Execution (Server)
   ├─ Calls getSchoolCredentials()
   ├─ getSchoolCredentials() calls getSchoolHeader()
   ├─ getSchoolHeader() reads x-school-username
   ├─ Queries Supabase for school data
   ├─ Result cached by React cache() for request
   └─ Returns SchoolCredentials object

3. Provider Initialization
   ├─ Receives credentials from layout
   ├─ Validates credentials exist
   └─ Provides via context to all children

4. Components Use Credentials
   ├─ Client components: useSchoolCredentials() hook
   ├─ Server pages: import getSchoolHeader() directly
   └─ No duplicate fetches (cached at request level)
```

## Request-Level Caching

React's `cache()` function ensures that if `getSchoolHeader()` is called multiple times during a single request (e.g., in layout + multiple child pages), the database is only queried **once**:

```typescript
// First call during layout rendering
const credentials = await getSchoolHeader(); // DB hit

// Second call in child page (same request)
const credentials2 = await getSchoolHeader(); // Cache hit, no DB

// Third call in another component (same request)
const credentials3 = await getSchoolHeader(); // Cache hit, no DB
```

This is handled automatically by wrapping the function:

```typescript
export const getSchoolHeader = cache(async () => {
    // This function body runs max once per request
    // Subsequent calls within the same request get the cached result
});
```

## Header Key Support

The system supports both header keys for flexibility:

- **`x-school-username`** - Set by proxy for subdomain routes and authenticated requests
- **`username`** - Legacy support for backwards compatibility

Code checks both keys:

```typescript
const username = headersList.get("x-school-username") || headersList.get("username");
```

## CDN Image Handling

Logo and banner images are fetched from Cloudflare CDN:

### Located in `supabase/server/cdn.ts`:

```typescript
export const getCDNImages = cache(async (username: string) => {
    // 1. Check in-memory cache (1 hour TTL)
    if (cache.has(username)) return cache.get(username);

    // 2. HEAD request to verify URL exists
    const logoUrl = await verifyCDNUrl(`/logos/${username}.png`);
    const bannerUrl = await verifyCDNUrl(`/banners/${username}.png`);

    // 3. Fallback to admin assets if not found
    if (!logoUrl) return adminLogoUrl;
    if (!bannerUrl) return adminBannerUrl;

    // 4. Cache result for 1 hour
    cache.set(username, { logoUrl, bannerUrl });
    return { logoUrl, bannerUrl };
});
```

**Features:**

- In-memory caching to reduce HEAD requests
- Fallback to admin assets if school-specific not found
- Detailed logging for debugging asset issues
- Returns guaranteed URLs (never null)

### Example Usage:

```typescript
const images = await getCDNImages("kite-tarifa");
// Returns: { logoUrl: "https://cdn.../kite-tarifa.png", bannerUrl: "..." }
```

## Subdomain-Specific Fetching

Subdomain pages use dedicated function `getSchool4Subdomain()`:

**Located in `supabase/server/subdomain.ts`:**

```typescript
export async function getSchool4Subdomain(username: string) {
    // 1. Fetch school and packages
    // 2. Fetch CDN images via getCDNImages()
    // 3. Return SchoolWithPackages
}
```

**Usage in subdomain/page.tsx:**

```typescript
export default async function SubdomainPage() {
    const headersList = await headers();
    const username = headersList.get("x-school-username");

    if (!username) {
        return redirect("/error");
    }

    const schoolWithPackages = await getSchool4Subdomain(username);

    if (!schoolWithPackages) {
        return redirect("/error");
    }

    return <SubDomainHomePage school={schoolWithPackages} />;
}
```

## Troubleshooting

### CDN Images Not Loading

- Check browser console for "Empty string passed to src"
- This means `bannerUrl` or `logoUrl` is null or empty
- **Solution:** Ensure SchoolAssets interface uses `bannerUrl` and `iconUrl` (not `banner`/`logo`)
- Check CDN URL is accessible (HEAD request succeeds)

### Credentials Not Available

- Check if `x-school-username` header is set by proxy
- Verify school record exists in Supabase with matching username
- Check browser Network tab → headers for `x-school-username` value

### Duplicate Credential Calls

- Verify layout is using `cache(getSchoolCredentialsFromSupabase)`
- Check that multiple components aren't importing `getSchoolHeader()` without cache
- Use browser DevTools Network tab to count DB requests per page load (should be 1)

## References

- **Credentials Type:** [types/credentials.ts](../types/credentials.ts)
- **Centralized Fetching:** [types/headers.ts](../types/headers.ts#L1)
- **Admin Layout:** [src/app/(admin)/layout.tsx](<../src/app/(admin)/layout.tsx>)
- **Provider:** [src/providers/school-credentials-provider.tsx](../src/providers/school-credentials-provider.tsx)
- **CDN Handling:** [supabase/server/cdn.ts](../supabase/server/cdn.ts)
- **Subdomain Fetching:** [supabase/server/subdomain.ts](../supabase/server/subdomain.ts)

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

````

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
````

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
