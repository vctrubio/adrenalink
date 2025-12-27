import { sql } from "drizzle-orm";
import { db } from "@/drizzle/db";

// ============ PACKAGE ID PAGE STATS ============
// Optimized query for package detail page
// Calculates students, events, duration, and revenue for a single package

export interface PackageIdStats {
  student_count: number;
  events_count: number;
  total_duration_minutes: number;
  money_in: number;
}

export async function getPackageIdStats(packageId: string): Promise<PackageIdStats> {
  const result = await db.execute(sql`
    SELECT
      COUNT(DISTINCT bs.student_id)::integer as student_count,
      COUNT(DISTINCT e.id)::integer as events_count,
      COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
      COALESCE(SUM(
        CASE WHEN e.id IS NOT NULL
          THEN (sp.price_per_student * (SELECT COUNT(*) FROM booking_student WHERE booking_id = b.id)) *
               (e.duration::decimal / NULLIF(sp.duration_minutes, 0))
          ELSE 0
        END
      ), 0)::numeric as money_in
    FROM school_package sp
    LEFT JOIN student_package stp ON stp.school_package_id = sp.id
    LEFT JOIN booking b ON b.student_package_id = stp.id
    LEFT JOIN lesson l ON l.booking_id = b.id
    LEFT JOIN event e ON e.lesson_id = l.id
    LEFT JOIN booking_student bs ON bs.booking_id = b.id
    WHERE sp.id = ${packageId}
  `);

  const row = Array.isArray(result) ? result[0] : (result as any).rows?.[0];

  return {
    student_count: row?.student_count || 0,
    events_count: row?.events_count || 0,
    total_duration_minutes: row?.total_duration_minutes || 0,
    money_in: Number(row?.money_in || 0),
  };
}
