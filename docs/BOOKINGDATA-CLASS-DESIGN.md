# BookingData Class Architecture

## Overview

`BookingData` is a frontend-focused class that wraps booking data and provides revenue calculation methods. It's instantiated once you fetch a booking with its related data, and it handles all revenue computations for display.

## Problem Solved

When you fetch a booking, you have:

- `booking_id`
- `school_package_id`
- `lessons[]` (array of lessons for this booking)
- `lessons[].events[]` (array of events for each lesson)
- `lessons[].commission_id` (teacher commission reference)

Instead of manually calculating revenue across multiple nested structures, `BookingData` centralizes this logic.

## Class Design

```typescript
// supabase/db/models/BookingData.ts

export class BookingData {
    id: string;
    school_id: string;
    school_package_id: string;
    date_start: Date;
    date_end: Date;
    leader_student_name: string;
    status: string;

    // Nested data (populated via eager loading)
    school_package: {
        price_per_student: number;
        duration_minutes: number;
        capacity_students: number;
    };

    booking_student: Array<{ student_id: string }>;

    lessons: Array<{
        id: string;
        teacher_id: string;
        commission_id: string;
        teacher_commission: {
            cph: number;
        };
        events: Array<{
            id: string;
            date: Date;
            duration: number;
            status: string;
        }>;
    }>;

    constructor(data: any) {
        Object.assign(this, data);
    }

    // ===========================
    // 1. BOOKING-LEVEL REVENUE
    // ===========================

    /**
     * Get total revenue for entire booking (all events combined)
     * @returns { grossRevenue, teacherCommissions, netRevenue, eventCount }
     */
    getRevenue() {
        let totalGross = 0;
        let totalCommission = 0;
        let eventCount = 0;

        // Iterate all lessons and events
        this.lessons.forEach((lesson) => {
            lesson.events.forEach((event) => {
                const eventRevenue = this._calculateEventRevenue(lesson, event);
                totalGross += eventRevenue.gross;
                totalCommission += eventRevenue.commission;
                eventCount++;
            });
        });

        return {
            grossRevenue: totalGross,
            teacherCommissions: totalCommission,
            netRevenue: totalGross - totalCommission,
            eventCount,
            studentCount: this.booking_student.length,
            averagePerEvent: eventCount > 0 ? (totalGross - totalCommission) / eventCount : 0,
        };
    }

    // ===========================
    // 2. EVENT-LEVEL REVENUE
    // ===========================

    /**
     * Get revenue breakdown for a specific event
     * @param event - The event object
     * @returns { eventId, lessonId, date, duration, grossRevenue, teacherCommission, netRevenue }
     */
    getRevenueOfEvent(event: any) {
        // Find the lesson this event belongs to
        const lesson = this.lessons.find((l) => l.events.some((e) => e.id === event.id));

        if (!lesson) {
            throw new Error(`Event ${event.id} not found in booking lessons`);
        }

        const revenue = this._calculateEventRevenue(lesson, event);

        return {
            eventId: event.id,
            lessonId: lesson.id,
            teacherId: lesson.teacher_id,
            date: event.date,
            duration: event.duration,
            grossRevenue: revenue.gross,
            teacherCommission: revenue.commission,
            netRevenue: revenue.net,
            studentCount: this.booking_student.length,
            pricePerStudent: this.school_package.price_per_student,
            commissionHourly: lesson.teacher_commission.cph,
        };
    }

    // ===========================
    // 3. LESSON-LEVEL REVENUE
    // ===========================

    /**
     * Get revenue breakdown for all events in a lesson
     * @param lessonId - The lesson ID
     * @returns { lessonId, teacherId, eventCount, grossRevenue, teacherCommission, netRevenue, events[] }
     */
    getRevenueOfLesson(lessonId: string) {
        const lesson = this.lessons.find((l) => l.id === lessonId);

        if (!lesson) {
            throw new Error(`Lesson ${lessonId} not found in booking`);
        }

        let totalGross = 0;
        let totalCommission = 0;
        const events = [];

        lesson.events.forEach((event) => {
            const revenue = this._calculateEventRevenue(lesson, event);
            totalGross += revenue.gross;
            totalCommission += revenue.commission;

            events.push({
                eventId: event.id,
                date: event.date,
                duration: event.duration,
                grossRevenue: revenue.gross,
                teacherCommission: revenue.commission,
                netRevenue: revenue.net,
            });
        });

        return {
            lessonId: lesson.id,
            teacherId: lesson.teacher_id,
            eventCount: lesson.events.length,
            grossRevenue: totalGross,
            teacherCommissions: totalCommission,
            netRevenue: totalGross - totalCommission,
            studentCount: this.booking_student.length,
            events,
        };
    }

    // ===========================
    // 4. PRIVATE CALCULATIONS
    // ===========================

    /**
     * Core revenue calculation for a single event
     * Formula:
     *   Gross = price_per_student * student_count
     *   Commission = cph * (duration_minutes / 60)
     *   Net = Gross - Commission
     */
    private _calculateEventRevenue(lesson: any, event: any) {
        const studentCount = this.booking_student.length;
        const pricePerStudent = this.school_package.price_per_student;
        const cph = lesson.teacher_commission.cph;
        const durationHours = event.duration / 60;

        const gross = pricePerStudent * studentCount;
        const commission = cph * durationHours;
        const net = gross - commission;

        return {
            gross,
            commission,
            net,
            studentCount,
            durationHours,
        };
    }

    // ===========================
    // 5. SUMMARY & REPORTING
    // ===========================

    /**
     * Get summary stats for the booking
     */
    getSummary() {
        const bookingRevenue = this.getRevenue();
        const totalDuration = this.lessons.reduce(
            (sum, lesson) => sum + lesson.events.reduce((lessonSum, event) => lessonSum + event.duration, 0),
            0,
        );

        return {
            bookingId: this.id,
            studentCount: this.booking_student.length,
            lessonCount: this.lessons.length,
            eventCount: bookingRevenue.eventCount,
            totalDurationMinutes: totalDuration,
            totalDurationHours: totalDuration / 60,
            grossRevenue: bookingRevenue.grossRevenue,
            totalCommissions: bookingRevenue.teacherCommissions,
            netRevenue: bookingRevenue.netRevenue,
            profitMargin:
                bookingRevenue.grossRevenue > 0
                    ? ((bookingRevenue.netRevenue / bookingRevenue.grossRevenue) * 100).toFixed(2) + "%"
                    : "0%",
            costPerEvent: bookingRevenue.eventCount > 0 ? bookingRevenue.teacherCommissions / bookingRevenue.eventCount : 0,
            revenuePerEvent: bookingRevenue.eventCount > 0 ? bookingRevenue.netRevenue / bookingRevenue.eventCount : 0,
        };
    }
}
```

## Usage Examples

### Example 1: Display Total Booking Revenue

```typescript
// In a component
import { BookingData } from '@/supabase/db/models/BookingData';

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
    const { data } = useAsync(async () => {
        const booking = await supabase
            .from('booking')
            .select(`
                *,
                school_package(*),
                booking_student(*),
                lessons(
                    id,
                    teacher_id,
                    teacher_commission(cph),
                    events(*)
                )
            `)
            .eq('id', bookingId)
            .single();

        return new BookingData(booking);
    });

    if (!data) return <div>Loading...</div>;

    const revenue = data.getRevenue();

    return (
        <div>
            <h1>Booking Details</h1>
            <p>Gross Revenue: ${revenue.grossRevenue}</p>
            <p>Teacher Commissions: ${revenue.teacherCommissions}</p>
            <p>Net Profit: ${revenue.netRevenue}</p>
            <p>Events: {revenue.eventCount}</p>
        </div>
    );
}
```

### Example 2: Display Per-Event Breakdown

```typescript
export function EventBreakdownView({ bookingData }: { bookingData: BookingData }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Event Date</th>
                    <th>Duration</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Net</th>
                </tr>
            </thead>
            <tbody>
                {bookingData.lessons.map((lesson) =>
                    lesson.events.map((event) => {
                        const rev = bookingData.getRevenueOfEvent(event);
                        return (
                            <tr key={event.id}>
                                <td>{new Date(event.date).toLocaleDateString()}</td>
                                <td>{event.duration} min</td>
                                <td>${rev.grossRevenue}</td>
                                <td>${rev.teacherCommission.toFixed(2)}</td>
                                <td>${rev.netRevenue}</td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    );
}
```

### Example 3: Lesson Summary

```typescript
export function LessonSummary({ bookingData, lessonId }: any) {
    const lessonRevenue = bookingData.getRevenueOfLesson(lessonId);

    return (
        <div>
            <h3>Lesson {lessonId}</h3>
            <p>Teacher: {lessonRevenue.teacherId}</p>
            <p>Events: {lessonRevenue.eventCount}</p>
            <p>Total Revenue: ${lessonRevenue.netRevenue}</p>
            <p>Teacher Commission: ${lessonRevenue.teacherCommissions}</p>
        </div>
    );
}
```

### Example 4: Transaction Dashboard

```typescript
export function TransactionDashboard({ bookingData }: { bookingData: BookingData }) {
    const summary = bookingData.getSummary();

    return (
        <div className="dashboard">
            <div className="card">
                <h3>Gross Revenue</h3>
                <p className="amount">${summary.grossRevenue}</p>
            </div>
            <div className="card">
                <h3>Teacher Commissions</h3>
                <p className="amount">${summary.totalCommissions}</p>
            </div>
            <div className="card">
                <h3>Net Profit</h3>
                <p className="amount">${summary.netRevenue}</p>
            </div>
            <div className="card">
                <h3>Profit Margin</h3>
                <p className="amount">{summary.profitMargin}</p>
            </div>
            <div className="card">
                <h3>Revenue Per Event</h3>
                <p className="amount">${summary.revenuePerEvent.toFixed(2)}</p>
            </div>
        </div>
    );
}
```

## Data Flow

```
1. Fetch Booking from Supabase
   ↓
   booking (with related data)

2. Instantiate BookingData
   ↓
   const booking = new BookingData(data);

3. Call Revenue Methods
   ├─ booking.getRevenue()           → Total for booking
   ├─ booking.getRevenueOfEvent(e)   → Per-event breakdown
   ├─ booking.getRevenueOfLesson(l)  → Per-lesson breakdown
   └─ booking.getSummary()            → Dashboard metrics

4. Display in Components
   ↓
   Render revenue data
```

## Required Supabase Select

When fetching booking, include all nested relations:

```typescript
const booking = await supabase
    .from("booking")
    .select(
        `
        id,
        school_id,
        school_package_id,
        date_start,
        date_end,
        leader_student_name,
        status,
        school_package(
            price_per_student,
            duration_minutes,
            capacity_students
        ),
        booking_student(
            student_id
        ),
        lessons(
            id,
            teacher_id,
            commission_id,
            teacher_commission(
                cph
            ),
            events(
                id,
                date,
                duration,
                status
            )
        )
    `,
    )
    .eq("id", bookingId)
    .single();

const bookingData = new BookingData(booking);
```

## Benefits

1. **Reusability**: Single instantiation, use across entire app
2. **Consistency**: Same calculations everywhere
3. **Maintainability**: Logic in one place, not scattered in components
4. **Flexibility**: Methods for different levels (booking, lesson, event)
5. **Performance**: Calculations happen in-memory, not database
6. **Type Safety**: TypeScript ensures correct method calls

## Future Enhancements

- Add student-level breakdowns
- Add date range filtering
- Add teacher payment splits
- Add discount/fee calculations
- Add export to CSV/PDF
