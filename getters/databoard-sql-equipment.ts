import { sql } from "drizzle-orm";
import { db } from "@/drizzle/db";

// ============ EQUIPMENT ID PAGE STATS ============
// Optimized query for equipment detail page
// Calculates lessons, events, duration, and revenue for a single equipment

export interface EquipmentIdStats {
  lessons_count: number;
  events_count: number;
  total_duration_minutes: number;
  total_revenue: number;
}

export async function getEquipmentIdStats(equipmentId: string): Promise<EquipmentIdStats> {
  const result = await db.execute(sql`
    SELECT
      COUNT(DISTINCT l.id)::integer as lessons_count,
      COUNT(DISTINCT e.id)::integer as events_count,
      COALESCE(SUM(e.duration), 0)::integer as total_duration_minutes,
      COALESCE(SUM(
        (sp.price_per_student * sp.capacity_students) *
        (e.duration::decimal / NULLIF(sp.duration_minutes, 0))
      ), 0)::integer as total_revenue
    FROM equipment eq
    LEFT JOIN equipment_event ee ON ee.equipment_id = eq.id
    LEFT JOIN event e ON e.id = ee.event_id
    LEFT JOIN lesson l ON l.id = e.lesson_id
    LEFT JOIN booking b ON b.id = l.booking_id
    LEFT JOIN student_package stp ON stp.id = b.student_package_id
    LEFT JOIN school_package sp ON sp.id = stp.school_package_id
    WHERE eq.id = ${equipmentId}
  `);

  const row = Array.isArray(result) ? result[0] : (result as any).rows?.[0];

  return {
    lessons_count: row?.lessons_count || 0,
    events_count: row?.events_count || 0,
    total_duration_minutes: row?.total_duration_minutes || 0,
    total_revenue: row?.total_revenue || 0,
  };
}
