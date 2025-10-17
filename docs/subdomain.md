# Subdomain Configuration for School Portals

## Overview

This document explains how to configure subdomain-based routing for school portals, allowing each school to access their dedicated portal via `{school-username}.domain.com` instead of `domain.com/schools/{school-username}`.

## Architecture

### URL Structure

#### Production (CRITICAL)
- **Main Site**: `adrenalink.com`
- **School Portals**: `{school.username}.adrenalink.com`
- **Examples**: 
  - `mit.adrenalink.com` → MIT's school portal
  - `harvard.adrenalink.com` → Harvard's school portal
  - `stanford.adrenalink.com` → Stanford's school portal

#### Development/Testing
- **Main Site**: `localhost:3000`
- **School Portals**: `{school.username}.lvh.me:3000` (recommended for testing)
- **Examples**: 
  - `mit.lvh.me:3000` → MIT's school portal
  - `harvard.lvh.me:3000` → Harvard's school portal

### Technical Implementation

#### 1. Middleware Setup
Next.js middleware intercepts requests and determines routing based on subdomain:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  // Skip if it's the main domain or localhost without subdomain
  if (subdomain === 'localhost' || subdomain === 'www' || hostname === 'localhost:3000') {
    return NextResponse.next();
  }

  // Route to school portal
  url.pathname = `/schools/${subdomain}/portal${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

#### 2. File Structure
```
src/
├── app/
│   ├── schools/
│   │   └── [username]/
│   │       └── portal/
│   │           └── page.tsx    # School subdomain portal
│   └── page.tsx                # Main site
└── portals/
    └── AdminSubdomain.tsx      # School portal component
```

#### 3. Database Integration
- Use `school.username` field for subdomain matching
- Validate subdomain exists in database
- Load school data based on subdomain

## Development Setup

### Local Development
For local testing with subdomains:

#### Option 1: Manual Hosts Configuration
Edit `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 mit.localhost
127.0.0.1 harvard.localhost
127.0.0.1 stanford.localhost
```

#### Option 2: Wildcard DNS (Recommended for Development)
Use services like:
- **lvh.me**: `mit.lvh.me:3000` (RECOMMENDED - most reliable)
- **nip.io**: `mit.127.0.0.1.nip.io:3000`
- **xip.io**: `mit.127.0.0.1.xip.io:3000`

These automatically resolve to localhost without configuration.

**Why lvh.me is preferred:**
- Simple syntax: `{username}.lvh.me:3000`
- Reliable DNS resolution
- No IP addresses in URL
- Closest to production format

### Production Setup (CRITICAL REQUIREMENTS)

#### DNS Configuration
**MUST configure wildcard DNS records:**
```
A    *.adrenalink.com    → Your server IP
A    adrenalink.com      → Your server IP
CNAME *.adrenalink.com  → adrenalink.com (alternative)
```

**Production URL Structure:**
- Main site: `https://adrenalink.com`
- School portals: `https://{username}.adrenalink.com`
- This is the ONLY acceptable production format

#### SSL/TLS (REQUIRED)
Configure wildcard SSL certificate:
- **Option 1**: Let's Encrypt with wildcard support
- **Option 2**: Cloudflare for automatic SSL (RECOMMENDED)
- **Option 3**: Commercial wildcard certificate

#### Middleware Environment Detection
```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Production: {username}.adrenalink.com
  // Development: {username}.lvh.me:3000
  const parts = hostname.split('.');
  const subdomain = parts[0];
  
  // Skip main domain
  if (hostname === 'adrenalink.com' || hostname === 'localhost:3000' || subdomain === 'www') {
    return NextResponse.next();
  }
  
  // Route to school portal
  url.pathname = `/schools/${subdomain}/portal${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

## Security Considerations

### Subdomain Validation
- Validate subdomain against existing school usernames
- Return 404 for non-existent schools
- Prevent subdomain squatting

### Rate Limiting
- Implement per-subdomain rate limiting
- Protect against subdomain enumeration attacks

### Content Isolation
- Ensure school data isolation
- Validate user permissions for subdomain access

## Implementation Steps

### Phase 1: Basic Routing
1. Create middleware for subdomain detection
2. Set up school portal routes
3. Implement basic school portal page

### Phase 2: Enhanced Features
1. Custom school branding per subdomain
2. School-specific authentication
3. Custom domain support (schools can use their own domains)

### Phase 3: Advanced Features
1. Multi-tenant caching strategies
2. School-specific analytics
3. Custom portal configurations

## Testing Strategy

### Unit Tests
- Test subdomain extraction logic
- Validate routing behavior
- Test school data loading

### Integration Tests
- Test full subdomain flow
- Validate database queries
- Test error handling

### Manual Testing Checklist
- [ ] Main site loads at `localhost:3000`
- [ ] School portal loads at `{username}.localhost:3000`
- [ ] Non-existent subdomains return 404
- [ ] School data loads correctly
- [ ] Navigation works within portal

## Monitoring & Analytics

### Metrics to Track
- Subdomain usage per school
- Portal page views and engagement
- Error rates by subdomain

### Logging
- Log subdomain requests
- Track school portal access patterns
- Monitor subdomain resolution errors

## Future Enhancements

### Custom Domains
Allow schools to use their own domains:
- `portal.mit.edu` → MIT's portal
- `students.harvard.edu` → Harvard's portal

### White Label Solutions
- Custom branding per school
- School-specific themes
- Custom portal layouts