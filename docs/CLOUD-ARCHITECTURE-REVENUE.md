# Cloud Architecture: Revenue Calculation & Event Analysis

## Problem Statement

To calculate event revenue, you need:

```
event → lesson → booking → school_package (price, duration, capacity)
event → lesson → teacher_commission (commission)
booking → booking_student (count)
```

This creates **6+ table joins** just to show event revenue on a transaction view. Network overhead kills performance.

## Solution: Layered Optimization Strategy

### Layer 1: Database-Level Computation (PostgreSQL Functions)

**Best for**: Real-time calculations, single source of truth, complex business logic

Create a PostgreSQL function that calculates revenue atomically:

```sql
CREATE OR REPLACE FUNCTION get_event_revenue(event_id UUID)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    teacher_commission NUMERIC,
    student_total_revenue NUMERIC,
    gross_revenue NUMERIC,
    net_revenue NUMERIC,
    student_count INTEGER,
    duration_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.lesson_id,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC AS teacher_commission,
        (sp.price_per_student * bs_count.count)::NUMERIC AS student_total,
        (sp.price_per_student * bs_count.count)::NUMERIC AS gross,
        ((sp.price_per_student * bs_count.count)::NUMERIC - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC AS net,
        bs_count.count,
        e.duration
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN (
        SELECT booking_id, COUNT(*) as count
        FROM booking_student
        GROUP BY booking_id
    ) bs_count ON b.id = bs_count.booking_id
    WHERE e.id = event_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Usage in TypeScript:**

```typescript
// Single fetch, all calculations done in DB
const result = await supabase.rpc("get_event_revenue", { event_id: eventId }).single();

// Returns: { event_id, lesson_id, teacher_commission, student_total_revenue, ... }
```

**Pros:**

- ✅ Single network round trip
- ✅ All joins computed in database (fast)
- ✅ Transactional consistency
- ✅ Reusable across app

**Cons:**

- SQL complexity grows with features

---

### Layer 2: Denormalization (Add to Event Table)

**Best for**: Frequently accessed data, read-heavy workloads

Add cached columns to `event` table:

```sql
ALTER TABLE event ADD COLUMN package_price_per_student INTEGER;
ALTER TABLE event ADD COLUMN package_duration_minutes INTEGER;
ALTER TABLE event ADD COLUMN booking_student_count INTEGER;
ALTER TABLE event ADD COLUMN commission_hourly NUMERIC;

CREATE INDEX event_revenue_idx ON event(package_price_per_student, booking_student_count);
```

Update these when lesson/booking changes (trigger):

```sql
CREATE OR REPLACE FUNCTION update_event_revenue_fields()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE event e
    SET
        package_price_per_student = sp.price_per_student,
        package_duration_minutes = sp.duration_minutes,
        commission_hourly = tc.cph::NUMERIC,
        booking_student_count = (SELECT COUNT(*) FROM booking_student WHERE booking_id = NEW.booking_id)
    WHERE e.lesson_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_update_event_revenue
AFTER INSERT OR UPDATE ON lesson
FOR EACH ROW
EXECUTE FUNCTION update_event_revenue_fields();
```

**Usage in TypeScript:**

```typescript
// Fetch only event table
const event = await supabase
    .from("event")
    .select("*, package_price_per_student, booking_student_count, commission_hourly")
    .eq("id", eventId)
    .single();

// Compute in app
const revenue = {
    studentTotal: event.package_price_per_student * event.booking_student_count,
    teacherCommission: event.commission_hourly * (event.duration / 60),
    net: event.package_price_per_student * event.booking_student_count - event.commission_hourly * (event.duration / 60),
};
```

**Pros:**

- ✅ Single table fetch, no joins
- ✅ Fast index lookups
- ✅ Simple app-level calculation

**Cons:**

- ❌ Cache invalidation complexity
- ❌ Triggers add overhead on writes
- ⚠️ Risk of stale data if triggers fail

---

### Layer 3: Database Views (Read-Only)

**Best for**: Reporting, analytics, complex aggregations

Create a materialized view:

```sql
CREATE MATERIALIZED VIEW event_revenue_view AS
SELECT
    e.id as event_id,
    e.lesson_id,
    e.date,
    e.duration,
    l.booking_id,
    sp.price_per_student,
    tc.cph::NUMERIC as commission_hourly,
    (SELECT COUNT(*) FROM booking_student WHERE booking_id = l.booking_id) as student_count,
    sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = l.booking_id) as gross_student_revenue,
    tc.cph::NUMERIC * (e.duration::NUMERIC / 60) as teacher_commission_amount
FROM event e
JOIN lesson l ON e.lesson_id = l.id
JOIN teacher_commission tc ON l.commission_id = tc.id
JOIN booking b ON l.booking_id = b.id
JOIN school_package sp ON b.school_package_id = sp.id;

CREATE INDEX event_revenue_event_id_idx ON event_revenue_view(event_id);

-- Refresh when data changes
REFRESH MATERIALIZED VIEW CONCURRENTLY event_revenue_view;
```

**Usage in TypeScript:**

```typescript
const event = await supabase.from("event_revenue_view").select("*").eq("event_id", eventId).single();

const net = event.gross_student_revenue - event.teacher_commission_amount;
```

**Pros:**

- ✅ Pre-computed joins
- ✅ Great for analytics/dashboards
- ✅ Consistent schema

**Cons:**

- ⚠️ Must refresh manually or on schedule
- ❌ Slightly stale data

---

### Layer 4: Supabase Edge Functions (Orchestration)

**Best for**: Complex business logic, external API calls, multi-step calculations

```typescript
// supabase/functions/calculate-event-revenue/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
    const { eventId } = await req.json();

    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Single call to PostgreSQL function
    const { data, error } = await supabase.rpc("get_event_revenue", { event_id: eventId });

    if (error) return new Response(JSON.stringify({ error }), { status: 400 });

    // Add business logic: discounts, taxes, fees
    const withFees = {
        ...data[0],
        platform_fee: data[0].gross_revenue * 0.05,
        final_amount: data[0].net_revenue * 0.95,
    };

    return new Response(JSON.stringify(withFees), {
        headers: { "Content-Type": "application/json" },
    });
});
```

**Usage in TypeScript:**

```typescript
const revenue = await fetch("http://localhost:54321/functions/v1/calculate-event-revenue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
}).then((r) => r.json());
```

**Pros:**

- ✅ Centralized business logic
- ✅ Easy to add features (taxes, discounts, fraud detection)
- ✅ Can call external APIs

**Cons:**

- ⚠️ Extra network round trip
- ⚠️ Need to manage function deployment

---

## Recommended Architecture (Hybrid Approach)

### For Transaction View (Real-Time, User-Facing)

**Use PostgreSQL Function + Denormalization:**

```typescript
// Fetch denormalized event
const event = await supabase
    .from("event")
    .select(
        `
        id, 
        date, 
        duration,
        lesson(teacher(school_id)),
        package_price_per_student,
        booking_student_count,
        commission_hourly
    `,
    )
    .eq("id", eventId)
    .single();

// Calculate in app (millisecond speed)
const revenue = {
    gross: event.package_price_per_student * event.booking_student_count,
    commission: event.commission_hourly * (event.duration / 60),
    net: event.package_price_per_student * event.booking_student_count - event.commission_hourly * (event.duration / 60),
};
```

**Benefits:**

- Single table fetch (1 query)
- Zero joins
- App-level logic is flexible
- Cache invalidation is simple (update event row)

---

### For Reporting/Analytics (Batch)

**Use Materialized View:**

```typescript
// Fetch all events for a school in a date range
const events = await supabase
    .from("event_revenue_view")
    .select("*")
    .eq("school_id", schoolId)
    .gte("date", startDate)
    .lte("date", endDate);

const summary = {
    total_revenue: events.reduce((sum, e) => sum + e.gross_student_revenue, 0),
    total_commission: events.reduce((sum, e) => sum + e.teacher_commission_amount, 0),
    events: events.length,
};
```

**Benefits:**

- Pre-computed joins
- Fast aggregations
- Great for dashboards

---

### For Complex Logic (Payments, Settlements)

**Use Edge Function:**

```typescript
// Settlement calculation (runs monthly)
const settlement = await supabase.functions.invoke("calculate-settlement", {
    body: { schoolId, month: "2026-01-" },
});

// Returns:
// {
//   total_revenue: 50000,
//   teacher_commissions: 7500,
//   platform_fee: 2500,
//   net_payout: 40000,
//   breakdown: [...]
// }
```

---

## Implementation Priority

1. **Now**: Add denormalized fields to `event` table
    - `package_price_per_student`
    - `booking_student_count`
    - `commission_hourly`

2. **Week 2**: Create PostgreSQL function `get_event_revenue()`

3. **Week 3**: Add materialized view for analytics

4. **Future**: Edge Functions for complex settlement logic

---

## Class-Based Approach (TypeScript Models)

Once you build TypeScript constructors, make them smart:

```typescript
// supabase/db/models/Event.ts
export class Event {
    id: string;
    lesson_id: string;
    duration: number;
    package_price_per_student: number;
    booking_student_count: number;
    commission_hourly: number;

    constructor(data: any) {
        Object.assign(this, data);
    }

    get grossRevenue(): number {
        return this.package_price_per_student * this.booking_student_count;
    }

    get teacherCommission(): number {
        return this.commission_hourly * (this.duration / 60);
    }

    get netRevenue(): number {
        return this.grossRevenue - this.teacherCommission;
    }

    // Usage: event.netRevenue
}
```

Then in your transaction component:

```typescript
const event = new Event(await supabase.from('event').select('*').eq('id', eventId).single());

return (
    <div>
        <p>Gross: ${event.grossRevenue}</p>
        <p>Commission: ${event.teacherCommission}</p>
        <p>Net: ${event.netRevenue}</p>
    </div>
);
```

---

## Key Takeaways

| Approach            | Fetches | Joins        | Latency | Best For                      |
| ------------------- | ------- | ------------ | ------- | ----------------------------- |
| PostgreSQL Function | 1       | DB-side      | ~50ms   | Real-time, accuracy critical  |
| Denormalization     | 1       | 0            | ~10ms   | User-facing, transaction view |
| Materialized View   | 1       | Pre-computed | ~10ms   | Reporting, analytics          |
| Edge Function       | 1-2     | Flexible     | ~100ms  | Complex logic, external APIs  |

**Choose denormalization + class methods** for your transaction view. It's the fastest and simplest.
