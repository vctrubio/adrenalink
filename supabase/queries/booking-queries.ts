/**
 * Booking Query Builders
 *
 * Replaces 2+ duplicated booking queries in classboard.ts and home.ts.
 * Single source of truth for booking SELECT statements with relations.
 *
 * Benefits:
 * - DRY: Define once, use everywhere
 * - Consistency: Same relations and fields across queries
 * - Maintenance: Update one place, reflects everywhere
 * - Type-safe: Full TypeScript support
 *
 * Usage:
 *   const query = supabase
 *     .from("booking")
 *     .select(getBookingSelectQuery());
 */

/**
 * Get standard booking SELECT query with all relations
 * Used when you need full booking data with nested relations
 *
 * Returns booking with:
 * - Basic fields (id, date_start, date_end, etc.)
 * - school_package details
 * - Student information
 * - Lesson/teacher information
 */
export function getBookingSelectQuery(): string {
    return `
        id,
        date_start,
        date_end,
        school_id,
        leader_student_name,
        school_package_id,
        school_package!inner(
            id,
            title,
            description,
            duration,
            price,
            sessions_remaining,
            status
        ),
        booking_student(
            id,
            first_name,
            last_name,
            email,
            phone
        ),
        lesson(
            id,
            teacher_id,
            start_at,
            end_at
        )
    `;
}

/**
 * Get minimal booking SELECT query
 * Used when you only need basic booking info (for lists, pagination, etc.)
 */
export function getBookingMinimalSelectQuery(): string {
    return `
        id,
        date_start,
        date_end,
        school_id,
        leader_student_name,
        school_package_id
    `;
}

/**
 * Get booking with package only
 * Used when you need booking + package details but not student/lesson info
 */
export function getBookingWithPackageSelectQuery(): string {
    return `
        id,
        date_start,
        date_end,
        school_id,
        school_package_id,
        school_package!inner(
            id,
            title,
            price,
            duration
        )
    `;
}

/**
 * Booking query constants (for WHERE clauses)
 */
export const BOOKING_QUERY_FILTERS = {
    /**
     * Filter for active bookings (not cancelled, not completed)
     */
    ACTIVE: "status.neq.cancelled,status.neq.completed",

    /**
     * Filter for future bookings
     */
    FUTURE: "date_start.gte.now()",

    /**
     * Filter for past bookings
     */
    PAST: "date_start.lt.now()",

    /**
     * Filter for this month
     */
    THIS_MONTH: (year: number, month: number) => {
        const start = `${year}-${String(month).padStart(2, "0")}-01`;
        const end = new Date(year, month, 0).toISOString().split("T")[0];
        return `date_start.gte.${start},date_start.lte.${end}`;
    },
};

/**
 * Examples:
 *
 * ===== BEFORE (classboard.ts lines 16-81) =====
 *
 * const { data: bookings } = await supabase
 *     .from("booking")
 *     .select(`
 *         id,
 *         date_start,
 *         date_end,
 *         school_id,
 *         leader_student_name,
 *         school_package_id,
 *         school_package!inner(...),
 *         booking_student(...),
 *         lesson(...)
 *     `)
 *     .eq("school_id", schoolId)
 *     .order("date_start");
 *
 * // SAME QUERY DUPLICATED IN home.ts
 *
 * ===== AFTER =====
 *
 * import { getBookingSelectQuery } from "@/supabase/queries/booking-queries";
 *
 * // In classboard.ts
 * const { data: bookings } = await supabase
 *     .from("booking")
 *     .select(getBookingSelectQuery())
 *     .eq("school_id", schoolId)
 *     .order("date_start");
 *
 * // In home.ts (same query builder, no duplication)
 * const { data: bookings } = await supabase
 *     .from("booking")
 *     .select(getBookingSelectQuery())
 *     .eq("school_id", schoolId)
 *     .order("date_start");
 *
 * ===== VARIATIONS =====
 *
 * // Minimal query for list view
 * .select(getBookingMinimalSelectQuery())
 *
 * // With package details only
 * .select(getBookingWithPackageSelectQuery())
 *
 * // With filters
 * .select(getBookingSelectQuery())
 * .eq("status", "active")
 * .gte("date_start", new Date().toISOString())
 */
