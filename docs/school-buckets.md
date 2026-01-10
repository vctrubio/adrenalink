# School Asset Management - Cloudflare R2

## Cloudflare R2 Bucket Structure

```
r2://adrenalink-assets/
├── admin/
│   ├── icon.png          # Default fallback icon (~100KB)
│   └── banner.png        # Default fallback banner (~500KB)
├── {username}/
│   ├── icon.png          # School-specific icon (~100KB)
│   ├── banner.jpeg       # School-specific banner (~500KB)
│   └── metadata.json     # School metadata
```

## Public URLs

Assets accessible via CDN domain for optimal performance:

```
https://cdn.adrenalink.tech/admin/icon.png       # Default fallback icon
https://cdn.adrenalink.tech/admin/banner.png     # Default fallback banner
https://cdn.adrenalink.tech/{username}/icon.png  # School icon
https://cdn.adrenalink.tech/{username}/banner.jpeg # School banner
```

## CDN Configuration

- **Primary Domain**: `cdn.adrenalink.tech` (Cloudflare CDN + R2)
- **Fallback**: Direct R2 public dev URL for development
- **Performance**: Unoptimized Next.js images for maximum speed
- **Caching**: Global edge caching via Cloudflare

## Reserved Subdomains

The following subdomains are reserved and cannot be used as school usernames:

- `assets` - Legacy asset domain
- `api` - API endpoints
- `www` - Main website
- `admin` - Admin dashboard
- `dashboard` - User dashboard
- `app` - Main application
- `cdn` - Content delivery network

## Metadata JSON

```json
{
    "school_username": "mit-kite-school",
    "school_name": "MIT Kite School",
    "owner_email": "admin@mitkiteschool.com",
    "reference_note": "Initial registration submission",
    "created_at": "2024-10-24T10:30:00Z",
    "approved_at": null
}
```

## Environment Configuration

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY=your-access-key
CLOUDFLARE_R2_SECRET_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET=adrenalink-assets
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.your-domain.com
CLOUDFLARE_ZONE_ID=your-zone-id
```

## Database Schema (Already Applied)

```sql
iconUrl: varchar("icon_url", { length: 500 }),
bannerUrl: varchar("banner_url", { length: 500 }),
status: schoolStatusEnum("status").notNull().default("pending"),
```

## Upload Flow

1. **Registration Form**: User uploads icon + banner files
2. **Upload to R2**: Files uploaded to `{username}/` folder
3. **Get Public URLs**: Generate URLs for uploaded assets
4. **Save to Database**: Store URLs in `iconUrl`/`bannerUrl` fields
5. **Display**: Subdomain page loads assets from R2 URLs

## Cost Benefits

- **Storage**: $0.015/GB/month (vs Google's $0.020/GB)
- **Egress**: FREE (vs Google's $0.12/GB)
- **Operations**: $4.50 per million requests
