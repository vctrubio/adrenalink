import { sql } from "drizzle-orm";

// ============ SQL STAT QUERY BUILDERS ============
// These queries calculate aggregated stats for databoard entities
// Pattern: All entities have events_count, total_duration_minutes, money_in, money_out

export function buildStudentStatsQuery(schoolId?: string) {
    return sql`
        SELECT
            s.id as entity_id,
            COUNT(DISTINCT bs.booking_id)::integer as bookings_count,
            COUNT(DISTINCT e.id)::integer as events_count,
            COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
            COUNT(DISTINCT sps.student_package_id) FILTER (WHERE sp.status = 'requested')::integer as requested_packages_count,
            COALESCE(SUM(sbp.amount), 0)::integer as money_in,
            COALESCE(SUM(
                (school_pkg.price_per_student * school_pkg.capacity_students) *
                (e.duration::decimal / NULLIF(school_pkg.duration_minutes, 0))
            ), 0)::integer as money_out
        FROM student s
        LEFT JOIN booking_student bs ON bs.student_id = s.id
        LEFT JOIN booking b ON b.id = bs.booking_id
        LEFT JOIN lesson l ON l.booking_id = b.id
        LEFT JOIN event e ON e.lesson_id = l.id
        LEFT JOIN student_booking_payment sbp ON sbp.student_id = s.id
        LEFT JOIN student_package_student sps ON sps.student_id = s.id
        LEFT JOIN student_package sp ON sp.id = sps.student_package_id
        LEFT JOIN student_package stp ON stp.id = b.student_package_id
        LEFT JOIN school_package school_pkg ON school_pkg.id = stp.school_package_id
        ${schoolId ? sql`WHERE b.school_id = ${schoolId}` : sql``}
        GROUP BY s.id
    `;
}

export function buildTeacherStatsQuery(schoolId?: string) {
    return sql`
        SELECT
            t.id as entity_id,
            COUNT(DISTINCT l.id)::integer as lessons_count,
            COUNT(DISTINCT e.id)::integer as events_count,
            COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
            COALESCE(SUM((e.duration::decimal / 60) * tc.cph), 0)::integer as money_in,
            COALESCE(SUM(tlp.amount), 0)::integer as money_out
        FROM teacher t
        LEFT JOIN lesson l ON l.teacher_id = t.id
        LEFT JOIN event e ON e.lesson_id = l.id
        LEFT JOIN teacher_commission tc ON tc.id = l.commission_id
        LEFT JOIN teacher_lesson_payment tlp ON tlp.lesson_id = l.id
        ${schoolId ? sql`WHERE t.school_id = ${schoolId}` : sql``}
        GROUP BY t.id
    `;
}

export function buildBookingStatsQuery(schoolId?: string) {
    return sql`
        SELECT
            b.id as entity_id,
            COUNT(DISTINCT e.id)::integer as events_count,
            COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
            COALESCE(SUM(
                (sp.price_per_student * sp.capacity_students) *
                (e.duration::decimal / NULLIF(sp.duration_minutes, 0))
            ), 0)::integer as money_in,
            COALESCE(SUM(
                CASE 
                    WHEN tc.commission_type = 'fixed' THEN (e.duration::decimal / 60) * tc.cph
                    WHEN tc.commission_type = 'percentage' THEN ((tc.cph / 100.0) * sp.price_per_student) * (e.duration::decimal / NULLIF(sp.duration_minutes, 0))
                    ELSE 0
                END
            ), 0)::integer as money_out
        FROM booking b
        LEFT JOIN lesson l ON l.booking_id = b.id
        LEFT JOIN event e ON e.lesson_id = l.id
        LEFT JOIN teacher_commission tc ON tc.id = l.commission_id
        LEFT JOIN student_package stp ON stp.id = b.student_package_id
        LEFT JOIN school_package sp ON sp.id = stp.school_package_id
        ${schoolId ? sql`WHERE b.school_id = ${schoolId}` : sql``}
        GROUP BY b.id
    `;
}

export function buildEquipmentStatsQuery(schoolId?: string) {
    return sql`
        SELECT
            e.id as entity_id,
            COUNT(DISTINCT ee.id)::integer as events_count,
            COALESCE(SUM(ev.duration), 0)::integer as total_duration_minutes,
            COUNT(DISTINCT r.id)::integer as rentals_count,
            COALESCE(SUM(
                (sp.price_per_student * sp.capacity_students) *
                (ev.duration::decimal / NULLIF(sp.duration_minutes, 0))
            ), 0)::integer as money_in,
            COALESCE(SUM(er.price), 0)::integer as money_out
        FROM equipment e
        LEFT JOIN equipment_event ee ON ee.equipment_id = e.id
        LEFT JOIN event ev ON ev.id = ee.event_id
        LEFT JOIN lesson l ON l.id = ev.lesson_id
        LEFT JOIN booking b ON b.id = l.booking_id
        LEFT JOIN student_package stp ON stp.id = b.student_package_id
        LEFT JOIN school_package sp ON sp.id = stp.school_package_id
        LEFT JOIN rental r ON r.equipment_id = e.id
        LEFT JOIN equipment_repair er ON er.equipment_id = e.id
        ${schoolId ? sql`WHERE e.school_id = ${schoolId}` : sql``}
        GROUP BY e.id
    `;
}

export function buildStudentPackageStatsQuery(schoolId?: string) {
    if (schoolId) {
        return sql`
            SELECT
                sp.id as entity_id,
                COUNT(DISTINCT sps.student_id)::integer as student_count,
                COUNT(DISTINCT e.id)::integer as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                COALESCE(SUM(
                    (pkg.price_per_student * pkg.capacity_students) *
                    (e.duration::decimal / NULLIF(pkg.duration_minutes, 0))
                ), 0)::integer as money_in,
                COALESCE(SUM(
                    CASE
                        WHEN ref.commission_type = 'fixed' THEN ref.commission_value::integer
                        WHEN ref.commission_type = 'percentage' THEN (pkg.price_per_student * (ref.commission_value::decimal / 100))::integer
                        ELSE 0
                    END
                ), 0)::integer as money_out
            FROM student_package sp
            LEFT JOIN school_package pkg ON pkg.id = sp.school_package_id
            LEFT JOIN student_package_student sps ON sps.student_package_id = sp.id
            LEFT JOIN booking b ON b.student_package_id = sp.id
            LEFT JOIN lesson l ON l.booking_id = b.id
            LEFT JOIN event e ON e.lesson_id = l.id
            LEFT JOIN referral ref ON ref.id = sp.referral_id
            WHERE pkg.school_id = ${schoolId}
            GROUP BY sp.id
        `;
    } else {
        return sql`
            SELECT
                sp.id as entity_id,
                COUNT(DISTINCT sps.student_id)::integer as student_count,
                COUNT(DISTINCT e.id)::integer as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                COALESCE(SUM(
                    (pkg.price_per_student * pkg.capacity_students) *
                    (e.duration::decimal / NULLIF(pkg.duration_minutes, 0))
                ), 0)::integer as money_in,
                COALESCE(SUM(
                    CASE
                        WHEN ref.commission_type = 'fixed' THEN ref.commission_value::integer
                        WHEN ref.commission_type = 'percentage' THEN (pkg.price_per_student * (ref.commission_value::decimal / 100))::integer
                        ELSE 0
                    END
                ), 0)::integer as money_out
            FROM student_package sp
            LEFT JOIN school_package pkg ON pkg.id = sp.school_package_id
            LEFT JOIN student_package_student sps ON sps.student_package_id = sp.id
            LEFT JOIN booking b ON b.student_package_id = sp.id
            LEFT JOIN lesson l ON l.booking_id = b.id
            LEFT JOIN event e ON e.lesson_id = l.id
            LEFT JOIN referral ref ON ref.id = sp.referral_id
            GROUP BY sp.id
        `;
    }
}

export function buildSchoolPackageStatsQuery(schoolId?: string) {
    if (schoolId) {
        return sql`
            SELECT
                pkg.id as entity_id,
                COUNT(DISTINCT bs.student_id)::integer as student_count,
                COUNT(DISTINCT e.id)::integer as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                COALESCE(SUM(
                    (pkg.price_per_student * pkg.capacity_students) *
                    (e.duration::decimal / NULLIF(pkg.duration_minutes, 0))
                ), 0)::integer as money_in,
                COALESCE(SUM((e.duration::decimal / 60) * tc.cph), 0)::integer as money_out
            FROM school_package pkg
            LEFT JOIN student_package stp ON stp.school_package_id = pkg.id
            LEFT JOIN booking b ON b.student_package_id = stp.id
            LEFT JOIN booking_student bs ON bs.booking_id = b.id
            LEFT JOIN lesson l ON l.booking_id = b.id
            LEFT JOIN event e ON e.lesson_id = l.id
            LEFT JOIN teacher_commission tc ON tc.id = l.commission_id
            WHERE pkg.school_id = ${schoolId}
            GROUP BY pkg.id
        `;
    } else {
        return sql`
            SELECT
                pkg.id as entity_id,
                COUNT(DISTINCT bs.student_id)::integer as student_count,
                COUNT(DISTINCT e.id)::integer as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                COALESCE(SUM(
                    (pkg.price_per_student * pkg.capacity_students) *
                    (e.duration::decimal / NULLIF(pkg.duration_minutes, 0))
                ), 0)::integer as money_in,
                COALESCE(SUM((e.duration::decimal / 60) * tc.cph), 0)::integer as money_out
            FROM school_package pkg
            LEFT JOIN student_package stp ON stp.school_package_id = pkg.id
            LEFT JOIN booking b ON b.student_package_id = stp.id
            LEFT JOIN booking_student bs ON bs.booking_id = b.id
            LEFT JOIN lesson l ON l.booking_id = b.id
            LEFT JOIN event e ON e.lesson_id = l.id
            LEFT JOIN teacher_commission tc ON tc.id = l.commission_id
            GROUP BY pkg.id
        `;
    }
}

export function buildReferralStatsQuery(schoolId?: string) {
    if (schoolId) {
        return sql`
            SELECT
                ref.id as entity_id,
                COUNT(DISTINCT sps.student_id)::integer as student_count,
                COUNT(DISTINCT e.id)::integer as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                COALESCE(SUM(
                    (pkg.price_per_student * pkg.capacity_students) *
                    (e.duration::decimal / NULLIF(pkg.duration_minutes, 0))
                ), 0)::integer as money_in,
                COALESCE(SUM(
                    CASE
                        WHEN ref.commission_type = 'fixed' THEN ref.commission_value::integer
                        WHEN ref.commission_type = 'percentage' THEN ((pkg.price_per_student * (ref.commission_value::decimal / 100)) * (e.duration::decimal / NULLIF(pkg.duration_minutes, 0)))::integer
                        ELSE 0
                    END
                ), 0)::integer as money_out
            FROM referral ref
            LEFT JOIN student_package sp ON sp.referral_id = ref.id
            LEFT JOIN student_package_student sps ON sps.student_package_id = sp.id
            LEFT JOIN booking b ON b.student_package_id = sp.id
            LEFT JOIN lesson l ON l.booking_id = b.id
            LEFT JOIN event e ON e.lesson_id = l.id
            LEFT JOIN school_package pkg ON pkg.id = sp.school_package_id
            WHERE ref.school_id = ${schoolId}
            GROUP BY ref.id
        `;
    } else {
        return sql`
            SELECT
                ref.id as entity_id,
                COUNT(DISTINCT sps.student_id)::integer as student_count,
                COUNT(DISTINCT e.id)::integer as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                COALESCE(SUM(
                    (pkg.price_per_student * pkg.capacity_students) *
                    (e.duration::decimal / NULLIF(pkg.duration_minutes, 0))
                ), 0)::integer as money_in,
                COALESCE(SUM(
                    CASE
                        WHEN ref.commission_type = 'fixed' THEN ref.commission_value::integer
                        WHEN ref.commission_type = 'percentage' THEN ((pkg.price_per_student * (ref.commission_value::decimal / 100)) * (e.duration::decimal / NULLIF(pkg.duration_minutes, 0)))::integer
                        ELSE 0
                    END
                ), 0)::integer as money_out
            FROM referral ref
            LEFT JOIN student_package sp ON sp.referral_id = ref.id
            LEFT JOIN student_package_student sps ON sps.student_package_id = sp.id
            LEFT JOIN booking b ON b.student_package_id = sp.id
            LEFT JOIN lesson l ON l.booking_id = b.id
            LEFT JOIN event e ON e.lesson_id = l.id
            LEFT JOIN school_package pkg ON pkg.id = sp.school_package_id
            GROUP BY ref.id
        `;
    }
}

export function buildEventStatsQuery(schoolId?: string) {
    if (schoolId) {
        return sql`
            SELECT
                e.id as entity_id,
                0 as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                0 as money_in,
                0 as money_out
            FROM event e
            WHERE e.school_id = ${schoolId}
            GROUP BY e.id
        `;
    } else {
        return sql`
            SELECT
                e.id as entity_id,
                0 as events_count,
                COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
                0 as money_in,
                0 as money_out
            FROM event e
            GROUP BY e.id
        `;
    }
}

// ============ STATS MAP PARSER ============

export interface DataboardStats {
    bookings_count?: number;
    lessons_count?: number;
    events_count: number;
    total_duration_minutes: number;
    requested_packages_count?: number;
    student_count?: number;
    rentals_count?: number;
    money_in: number;
    money_out: number;
}

export function createStatsMap(statsRows: any[]): Map<string, DataboardStats> {
    const map = new Map<string, DataboardStats>();
    for (const row of statsRows || []) {
        map.set(row.entity_id, {
            bookings_count: row.bookings_count || undefined,
            lessons_count: row.lessons_count || undefined,
            events_count: row.events_count || 0,
            total_duration_minutes: row.total_duration_minutes || 0,
            requested_packages_count: row.requested_packages_count || undefined,
            student_count: row.student_count || undefined,
            rentals_count: row.rentals_count || undefined,
            money_in: row.money_in || 0,
            money_out: row.money_out || 0,
        });
    }
    return map;
}
