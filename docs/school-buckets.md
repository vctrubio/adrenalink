# School Asset Management

## Google Cloud Storage Structure

```
gs://adrenalink-schools-forms/
├── {username}/
│   ├── icon.png          (~100KB)
│   ├── banner.jpeg       (~500KB)
│   └── metadata.json
```

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

## Database Schema Changes

### Add to school table:
```sql
iconUrl: varchar("icon_url", { length: 500 }),
bannerUrl: varchar("banner_url", { length: 500 }),
status: schoolStatusEnum("status").notNull().default("pending"),
```

### Create status enum:
```sql
export const schoolStatusEnum = pgEnum("school_status", ["active", "pending", "closed"]);
```

## Flow

1. **Registration**: School uploads assets → GCS folder created with icon.png + banner.jpeg + metadata.json
2. **Approval**: Admin approves → metadata.json `approved_at` updated + database status → "active"  
3. **Display**: Subdomain page reads `iconUrl`/`bannerUrl` from database