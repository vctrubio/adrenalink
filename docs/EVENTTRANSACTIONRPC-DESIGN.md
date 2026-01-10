# EventTransactionRpc Architecture

## Overview

`EventTransactionRpc` is a database-first approach using PostgreSQL RPC functions. Instead of fetching an event with all its nested relations (lesson → booking → package → commission), you call a single RPC function that does all the joins internally and returns only the calculated revenue.

**This is ideal for transaction views where you just need to show "how much did this event generate?"**

## Problem Solved

Instead of fetching:

```typescript
// BAD: Requires massive nested select
const event = await supabase
    .from("event")
    .select(
        `
        *,
        lesson(
            *,
            booking(
                *,
                school_package(*),
                booking_student(*)
            ),
            teacher_commission(*)
        )
    `,
    )
    .eq("id", eventId);
```

You call an RPC function:

```typescript
// GOOD: Single clean call, DB does the work
const revenue = await supabase.rpc("get_event_transaction", { event_id: eventId }).single();
```

## PostgreSQL RPC Function

Create this function in your Supabase database:

```sql
CREATE OR REPLACE FUNCTION get_event_transaction(event_id UUID)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE e.id = event_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

## TypeScript Wrapper

Create a utility function to call the RPC:

```typescript
// supabase/rpc/event_transaction.ts

import { SupabaseClient } from "@supabase/supabase-js";

export interface EventTransaction {
    event_id: string;
    lesson_id: string;
    booking_id: string;
    teacher_id: string;
    school_id: string;
    event_date: string;
    event_duration: number;
    student_count: number;
    price_per_student: number;
    commission_hourly: number;
    gross_revenue: number;
    teacher_commission: number;
    net_revenue: number;
}

/**
 * Fetch revenue data for a single event without loading full relations
 * @param supabase - Supabase client
 * @param eventId - Event ID to fetch revenue for
 * @returns Event transaction data with calculated revenue
 */
export async function getEventTransaction(supabase: SupabaseClient, eventId: string): Promise<EventTransaction> {
    const { data, error } = await supabase.rpc("get_event_transaction", { event_id: eventId }).single();

    if (error) {
        throw new Error(`Failed to fetch event transaction: ${error.message}`);
    }

    return data;
}

/**
 * Fetch revenue data for multiple events
 * @param supabase - Supabase client
 * @param eventIds - Array of event IDs
 * @returns Array of event transactions
 */
export async function getEventTransactions(supabase: SupabaseClient, eventIds: string[]): Promise<EventTransaction[]> {
    const { data, error } = await supabase.rpc("get_event_transactions_batch", {
        event_ids: eventIds,
    });

    if (error) {
        throw new Error(`Failed to fetch event transactions: ${error.message}`);
    }

    return data || [];
}

/**
 * Fetch all event transactions for a booking
 * @param supabase - Supabase client
 * @param bookingId - Booking ID
 * @returns Array of all event transactions for that booking
 */
export async function getBookingEventTransactions(supabase: SupabaseClient, bookingId: string): Promise<EventTransaction[]> {
    const { data, error } = await supabase.rpc("get_booking_event_transactions", {
        booking_id: bookingId,
    });

    if (error) {
        throw new Error(`Failed to fetch booking event transactions: ${error.message}`);
    }

    return data || [];
}

/**
 * Calculate summary stats for multiple event transactions
 */
export function summarizeTransactions(transactions: EventTransaction[]) {
    return {
        totalEvents: transactions.length,
        totalStudents: transactions.reduce((sum, t) => sum + t.student_count, 0),
        totalGrossRevenue: transactions.reduce((sum, t) => sum + t.gross_revenue, 0),
        totalTeacherCommissions: transactions.reduce((sum, t) => sum + t.teacher_commission, 0),
        totalNetRevenue: transactions.reduce((sum, t) => sum + t.net_revenue, 0),
        averageNetPerEvent: 0,
        profitMargin: 0,
    };
}
```

## Usage Examples

### Example 1: Display Single Event Transaction

```typescript
// components/TransactionRow.tsx
import { getEventTransaction } from '@/supabase/rpc/event_transaction';
import { useAsync } from '@react-hookz/web'; // or your favorite async hook

export function TransactionRow({ eventId }: { eventId: string }) {
    const { data: transaction } = useAsync(
        async () => getEventTransaction(supabase, eventId),
        [eventId]
    );

    if (!transaction) return <tr><td colSpan={6}>Loading...</td></tr>;

    return (
        <tr>
            <td>{new Date(transaction.event_date).toLocaleDateString()}</td>
            <td>{transaction.event_duration} min</td>
            <td>{transaction.student_count} students</td>
            <td>${transaction.gross_revenue}</td>
            <td>${transaction.teacher_commission.toFixed(2)}</td>
            <td className={transaction.net_revenue > 0 ? 'text-green' : 'text-red'}>
                ${transaction.net_revenue.toFixed(2)}
            </td>
        </tr>
    );
}
```

### Example 2: Transaction List for Booking

```typescript
// components/BookingTransactions.tsx
import { getBookingEventTransactions, summarizeTransactions } from '@/supabase/rpc/event_transaction';
import { useAsync } from '@react-hookz/web';

export function BookingTransactions({ bookingId }: { bookingId: string }) {
    const { data: transactions } = useAsync(
        async () => getBookingEventTransactions(supabase, bookingId),
        [bookingId]
    );

    if (!transactions) return <div>Loading...</div>;

    const summary = summarizeTransactions(transactions);

    return (
        <div className="booking-transactions">
            <h2>Transactions</h2>

            {/* Summary Cards */}
            <div className="summary-cards">
                <Card>
                    <h4>Gross Revenue</h4>
                    <p className="amount">${summary.totalGrossRevenue}</p>
                </Card>
                <Card>
                    <h4>Teacher Commissions</h4>
                    <p className="amount">${summary.totalTeacherCommissions.toFixed(2)}</p>
                </Card>
                <Card>
                    <h4>Net Profit</h4>
                    <p className="amount">${summary.totalNetRevenue.toFixed(2)}</p>
                </Card>
                <Card>
                    <h4>Events</h4>
                    <p className="amount">{summary.totalEvents}</p>
                </Card>
            </div>

            {/* Transaction Table */}
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Students</th>
                        <th>Price/Student</th>
                        <th>Gross</th>
                        <th>Commission</th>
                        <th>Net</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.event_id}>
                            <td>{new Date(t.event_date).toLocaleDateString()}</td>
                            <td>{t.event_duration} min</td>
                            <td>{t.student_count}</td>
                            <td>${t.price_per_student}</td>
                            <td>${t.gross_revenue}</td>
                            <td>${t.teacher_commission.toFixed(2)}</td>
                            <td className={t.net_revenue > 0 ? 'positive' : 'negative'}>
                                ${t.net_revenue.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

### Example 3: Transaction Dashboard

```typescript
// pages/TransactionDashboard.tsx
import { getBookingEventTransactions, summarizeTransactions } from '@/supabase/rpc/event_transaction';
import { useAsync } from '@react-hookz/web';

export function TransactionDashboard({ schoolId }: { schoolId: string }) {
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    const { data: transactions } = useAsync(
        async () => {
            // You'd create another RPC for date range queries
            const { data } = await supabase
                .rpc('get_school_event_transactions', {
                    school_id: schoolId,
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });
            return data || [];
        },
        [schoolId, dateRange]
    );

    if (!transactions) return <div>Loading...</div>;

    const summary = summarizeTransactions(transactions);
    const profitMargin = summary.totalGrossRevenue > 0
        ? ((summary.totalNetRevenue / summary.totalGrossRevenue) * 100).toFixed(1)
        : '0';

    return (
        <div className="dashboard">
            <h1>Transaction Dashboard</h1>

            {/* Date Range Filter */}
            <div className="filters">
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
                <Metric
                    label="Total Revenue"
                    value={`$${summary.totalGrossRevenue}`}
                    icon="💰"
                />
                <Metric
                    label="Total Commission"
                    value={`$${summary.totalTeacherCommissions.toFixed(2)}`}
                    icon="👨‍🏫"
                />
                <Metric
                    label="Net Profit"
                    value={`$${summary.totalNetRevenue.toFixed(2)}`}
                    icon="📈"
                    highlight={summary.totalNetRevenue > 0}
                />
                <Metric
                    label="Profit Margin"
                    value={`${profitMargin}%`}
                    icon="📊"
                />
                <Metric
                    label="Total Events"
                    value={summary.totalEvents}
                    icon="📅"
                />
                <Metric
                    label="Avg Revenue/Event"
                    value={`$${(summary.totalNetRevenue / summary.totalEvents).toFixed(2)}`}
                    icon="💹"
                />
            </div>

            {/* Transaction List */}
            <TransactionTable transactions={transactions} />
        </div>
    );
}
```

## Additional RPC Functions

### For Batch Queries

```sql
-- Get multiple events in one call
CREATE OR REPLACE FUNCTION get_event_transactions_batch(event_ids UUID[])
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE e.id = ANY(event_ids)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

### For Booking Events

```sql
-- Get all events and their transactions for a booking
CREATE OR REPLACE FUNCTION get_booking_event_transactions(booking_id UUID)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE b.id = booking_id
    ORDER BY e.date ASC;
END;
$$ LANGUAGE plpgsql STABLE;
```

### For School Date Range

```sql
-- Get all transactions for a school in a date range
CREATE OR REPLACE FUNCTION get_school_event_transactions(
    school_id UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    event_id UUID,
    lesson_id UUID,
    booking_id UUID,
    teacher_id UUID,
    school_id UUID,
    event_date TIMESTAMP WITH TIME ZONE,
    event_duration INTEGER,
    student_count INTEGER,
    price_per_student INTEGER,
    commission_hourly NUMERIC,
    gross_revenue NUMERIC,
    teacher_commission NUMERIC,
    net_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.lesson_id,
        b.id,
        l.teacher_id,
        e.school_id,
        e.date,
        e.duration,
        (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id)::INTEGER,
        sp.price_per_student,
        tc.cph::NUMERIC,
        (sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC,
        (tc.cph::NUMERIC * (e.duration::NUMERIC / 60))::NUMERIC,
        ((sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id))::NUMERIC
         - (tc.cph::NUMERIC * (e.duration::NUMERIC / 60)))::NUMERIC
    FROM event e
    JOIN lesson l ON e.lesson_id = l.id
    JOIN booking b ON l.booking_id = b.id
    JOIN school_package sp ON b.school_package_id = sp.id
    JOIN teacher_commission tc ON l.commission_id = tc.id
    WHERE e.school_id = school_id
        AND (start_date IS NULL OR DATE(e.date) >= start_date)
        AND (end_date IS NULL OR DATE(e.date) <= end_date)
    ORDER BY e.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Comparison: RPC vs BookingData Class

| Aspect              | EventTransactionRpc           | BookingData Class           |
| ------------------- | ----------------------------- | --------------------------- |
| **Data fetched**    | Only revenue numbers          | Full nested objects         |
| **DB joins**        | Done in database              | Done in app (single fetch)  |
| **Network payload** | Minimal (~1KB)                | Large (~50KB)               |
| **Latency**         | ~50ms                         | ~30ms (single large fetch)  |
| **Flexibility**     | Limited to RPC returns        | Full object manipulation    |
| **Use case**        | Transaction lists, dashboards | Detail views, complex logic |
| **Best for**        | Showing $$ everywhere         | Full booking management     |

## When to Use Each

**Use EventTransactionRpc when:**

- You only need revenue numbers
- Displaying transaction lists/tables
- Building dashboards with many events
- You want minimal network payload
- Multiple parallel event queries needed

**Use BookingData class when:**

- You need full booking details
- Managing/editing booking data
- Complex business logic on the booking
- Less data is fetched overall (detail view)

## Setup Steps

1. Create the RPC functions in Supabase SQL Editor (copy the functions above)
2. Create the TypeScript wrapper file: `supabase/rpc/event_transaction.ts`
3. Import and use in components:

    ```typescript
    import { getEventTransaction } from "@/supabase/rpc/event_transaction";

    const revenue = await getEventTransaction(supabase, eventId);
    ```

4. Call the RPC functions from your components as shown in the examples

## Benefits

✅ **Single source of truth** - All calculations in PostgreSQL  
✅ **Minimal network overhead** - Only returns what you need  
✅ **Reusable** - Call from anywhere, including API routes  
✅ **Type-safe** - TypeScript interfaces defined  
✅ **Fast** - Database-level joins are optimized  
✅ **Consistent** - Same calculation everywhere  
✅ **Scalable** - Can handle bulk queries with `get_event_transactions_batch`
