# Data Fetching Architecture

## Overview

This document explains the data fetching patterns used in Adrenalink, focusing on the trade-offs between complete data models and optimized queries.

## Current Architecture

### AbstractModel Pattern

All entity actions (bookings, students, teachers, etc.) return data using the `AbstractModel` pattern:

```typescript
export type AbstractModel<T> = {
    entityConfig: Omit<EntityConfig, "icon">;
    schema: T;
    relations?: Record<string, any>;
};
```

**Example: BookingModel**
```typescript
{
  entityConfig: {
    id: "booking",
    name: "Bookings",
    color: "text-blue-500",
    bgColor: "bg-blue-300",
    link: "/bookings",
    description: ["You accept the booking"],
    relations: ["teacher", "student", "schoolPackage", "lesson", "event"]
  },
  schema: {
    id: "cb6a795a-3a11-4ee6-b1af-48ff41032aee",
    packageId: "7518fbe7-f972-4b46-828b-283864ad3e29",
    dateStart: "2025-06-15",
    dateEnd: "2025-06-15",
    // ... other fields
  },
  relations: {
    school: { /* full school object */ },
    schoolPackage: { /* full package object */ },
    studentPackage: { /* full student package object */ },
    bookingStudents: [
      {
        student: { /* full student object */ }
      }
    ],
    lessons: [
      {
        teacher: { /* full teacher object */ },
        commission: { /* full commission object */ },
        events: [
          {
            equipmentEvents: [
              {
                equipment: { /* full equipment object */ }
              }
            ]
          }
        ],
        payments: [ /* payment objects */ ]
      }
    ]
  }
}
```

## The Problem

### 1. **Duplicate Metadata**
When fetching arrays of bookings, the `entityConfig` is duplicated in every item:
```typescript
[booking1, booking2, booking3]
// Each booking carries the same entityConfig object
```

### 2. **Deep Nesting**
Relations can be 5+ levels deep:
```
booking → lessons → events → equipmentEvents → equipment
```

### 3. **Search Complexity**
Finding bookings with specific criteria requires deep traversal:
```typescript
bookings.filter(b => 
  b.relations.bookingStudents.some(bs => 
    bs.student.firstName === "Emma"
  )
)
```

### 4. **Heavy Payloads**
A single booking can include 10+ related entities, making list views slow.

## Proposed Solutions

### Option 1: Collection Wrapper (Quick Fix)

Wrap arrays to avoid duplicate metadata:

```typescript
type EntityCollection<T> = {
  schemaTableName: string;
  entityConfig: Omit<EntityConfig, "icon">;
  data: Array<{ schema: T; relations?: Record<string, any> }>;
}
```

**Usage:**
```typescript
{
  schemaTableName: "booking",
  entityConfig: { /* once at top level */ },
  data: [
    { schema: {...}, relations: {...} },
    { schema: {...}, relations: {...} }
  ]
}
```

**Pros:**
- Removes duplicate metadata
- Minimal code changes
- Maintains full data access

**Cons:**
- Still heavy payloads
- Still deep nesting
- Search still complex

### Option 2: Light vs Heavy Queries (Recommended for Beta)

Create separate query types for different use cases:

**Light Queries** - For lists, tables, search:
```typescript
export async function getBookingsLight(): Promise<ApiActionResponseModel<BookingLight[]>> {
  const result = await db.query.booking.findMany({
    with: {
      school: { columns: { name: true } },
      schoolPackage: { columns: { description: true } },
      bookingStudents: {
        with: {
          student: { columns: { firstName: true, lastName: true } }
        }
      },
      lessons: {
        with: {
          teacher: { columns: { firstName: true, lastName: true } }
        }
      }
    }
  });
  
  return {
    success: true,
    data: result.map(b => ({
      id: b.id,
      dateStart: b.dateStart,
      dateEnd: b.dateEnd,
      schoolName: b.school.name,
      packageDescription: b.schoolPackage.description,
      studentNames: b.bookingStudents.map(bs => 
        `${bs.student.firstName} ${bs.student.lastName}`
      ),
      teacherName: b.lessons[0]?.teacher 
        ? `${b.lessons[0].teacher.firstName} ${b.lessons[0].teacher.lastName}`
        : null
    }))
  };
}
```

**Heavy Queries** - For detail views:
```typescript
export async function getBookingById(id: string): Promise<ApiActionResponseModel<BookingModel>> {
  // Keep current implementation with full relations
}
```

**Pros:**
- Fast list/table rendering
- Easy searching and filtering
- Maintains detailed views when needed
- No breaking changes to existing detail pages

**Cons:**
- Duplicate code (two query functions)
- Need to maintain both queries

### Option 3: Database Computed Columns (Future Optimization)

Add computed/denormalized columns to the booking table:

```sql
ALTER TABLE booking ADD COLUMN student_names TEXT[];
ALTER TABLE booking ADD COLUMN teacher_name TEXT;
ALTER TABLE booking ADD COLUMN package_description TEXT;
ALTER TABLE booking ADD COLUMN search_text TEXT;
```

Update via triggers or application code on INSERT/UPDATE.

**Pros:**
- Lightning-fast queries
- Simple search logic
- Scalable to millions of records

**Cons:**
- Database schema changes
- Sync complexity (keep computed fields updated)
- Storage overhead

### Option 4: PostgreSQL Materialized View (Production Scale)

Create a flattened view for searching:

```sql
CREATE MATERIALIZED VIEW bookings_search AS
SELECT 
  b.id,
  b.date_start,
  b.date_end,
  sc.name as school_name,
  sp.description as package_description,
  array_agg(DISTINCT s.first_name || ' ' || s.last_name) as student_names,
  array_agg(DISTINCT t.first_name || ' ' || t.last_name) as teacher_names
FROM booking b
LEFT JOIN school sc ON sc.id = b.school_id
LEFT JOIN school_package sp ON sp.id = b.package_id
LEFT JOIN booking_student bs ON bs.booking_id = b.id
LEFT JOIN student s ON s.id = bs.student_id
LEFT JOIN lesson l ON l.booking_id = b.id
LEFT JOIN teacher t ON t.id = l.teacher_id
GROUP BY b.id, b.date_start, b.date_end, sc.name, sp.description;

CREATE INDEX ON bookings_search (date_start);
CREATE INDEX ON bookings_search USING GIN (student_names);
```

Refresh on changes:
```sql
REFRESH MATERIALIZED VIEW bookings_search;
```

**Pros:**
- Extremely fast queries
- No application logic for denormalization
- Built-in PostgreSQL feature
- Supports full-text search

**Cons:**
- Requires manual/scheduled refresh
- Eventual consistency (not real-time)
- More complex deployment

## Recommendation

### For Beta v1 (Next 30 Days)

**Use Option 2: Light vs Heavy Queries**

1. **Immediate**: Keep current `getBookings()` as-is for detail views
2. **Add**: Create `getBookingsLight()` for list/table views
3. **Frontend**: Use light query for tables, heavy query for detail modals

```typescript
// List view
const { data: bookings } = await getBookingsLight();
<BookingsTable data={bookings} />

// Detail view (on row click)
const { data: booking } = await getBookingById(id);
<BookingDetailModal data={booking} />
```

### For Beta v2 (Post-Launch)

**Migrate to Option 3 or 4**

Once you have real data and usage patterns:
1. Analyze most common search queries
2. Add computed columns for frequently accessed fields
3. Consider materialized views for complex reports
4. Implement full-text search if needed

## Implementation Priority

### Phase 1: Quick Wins (This Week)
- [ ] Add `getBookingsLight()` function
- [ ] Update list views to use light query
- [ ] Keep detail views using full query

### Phase 2: Collection Wrapper (Optional)
- [ ] Create `EntityCollection<T>` type
- [ ] Wrap array responses to remove duplicate metadata
- [ ] Update frontend to handle new structure

### Phase 3: Database Optimization (Post-Beta)
- [ ] Identify most-searched fields from analytics
- [ ] Add computed columns for hot paths
- [ ] Create materialized views for reports
- [ ] Implement full-text search

## Measuring Success

### Performance Metrics
- **List Load Time**: < 500ms for 100 bookings
- **Search Response**: < 200ms for filtered results
- **Detail Load Time**: < 1s for full booking with relations

### Developer Experience
- **Query Clarity**: Easy to understand what data is fetched
- **Type Safety**: TypeScript types for all responses
- **Maintainability**: Changes propagate correctly

## Related Architecture

- See `/docs/beta.md` for beta timeline and features
- See `/backend/models/AbstractModel.ts` for current model pattern
- See `/actions/bookings-action.ts` for current implementation
