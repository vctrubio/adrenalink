"use server";

import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";
import { getSchoolIdFromHeader } from "@/types/headers";

export interface TransactionData {
  id: string;
  date: Date;
  duration: number;
  status: string;
  location?: string | null;
  teacher: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  commission: {
    type: "fixed" | "percentage";
    cph: number;
  } | null;
  package: {
    id: string;
    durationMinutes: number;
    pricePerStudent: number;
    capacityEquipment: number;
    categoryEquipment: string;
  };
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  equipment: Array<{
    model: string;
    size: number | null;
  }>;
}

interface RawTransactionRow {
  event_id: string;
  event_date: Date;
  event_duration: number;
  event_status: string;
  event_location: string | null;
  teacher_id: string;
  teacher_username: string;
  teacher_first_name: string;
  teacher_last_name: string;
  commission_type: "fixed" | "percentage" | null;
  commission_cph: string | null;
  package_id: string;
  package_duration_minutes: number;
  package_price_per_student: number;
  package_capacity_equipment: number;
  package_category_equipment: string;
  student_id: string | null;
  student_first_name: string | null;
  student_last_name: string | null;
  equipment_model: string | null;
  equipment_size: number | null;
}

export async function getTransactions(): Promise<TransactionData[]> {
  try {
    const schoolId = await getSchoolIdFromHeader();

    if (!schoolId) {
      return [];
    }

    // Single optimized SQL query with all JOINs
    const rows = await db.execute(
      sql`
        SELECT DISTINCT
          e.id as event_id,
          e.date as event_date,
          e.duration as event_duration,
          e.status as event_status,
          e.location as event_location,
          t.id as teacher_id,
          t.username as teacher_username,
          t.first_name as teacher_first_name,
          t.last_name as teacher_last_name,
          tc.commission_type,
          tc.cph as commission_cph,
          sp.id as package_id,
          sp.duration_minutes as package_duration_minutes,
          sp.price_per_student as package_price_per_student,
          sp.capacity_equipment as package_capacity_equipment,
          sp.category_equipment as package_category_equipment,
          s.id as student_id,
          s.first_name as student_first_name,
          s.last_name as student_last_name,
          eq.model as equipment_model,
          eq.size as equipment_size
        FROM event e
        INNER JOIN lesson l ON e.lesson_id = l.id
        INNER JOIN teacher t ON l.teacher_id = t.id
        LEFT JOIN teacher_commission tc ON l.commission_id = tc.id
        INNER JOIN booking b ON l.booking_id = b.id
        INNER JOIN student_package sp_rel ON b.student_package_id = sp_rel.id
        INNER JOIN school_package sp ON sp_rel.school_package_id = sp.id
        LEFT JOIN booking_student bs ON b.id = bs.booking_id
        LEFT JOIN student s ON bs.student_id = s.id
        LEFT JOIN equipment_event ee ON e.id = ee.event_id
        LEFT JOIN equipment eq ON ee.equipment_id = eq.id
        WHERE e.school_id = ${schoolId}
        ORDER BY e.date ASC, e.id ASC, s.id ASC
      `,
    );

    // Group results by event
    const transactionMap = new Map<string, TransactionData>();

    for (const row of rows as RawTransactionRow[]) {
      const eventId = row.event_id;

      if (!transactionMap.has(eventId)) {
        transactionMap.set(eventId, {
          id: eventId,
          date: row.event_date,
          duration: row.event_duration,
          status: row.event_status,
          location: row.event_location,
          teacher: {
            id: row.teacher_id,
            username: row.teacher_username,
            firstName: row.teacher_first_name,
            lastName: row.teacher_last_name,
          },
          commission: row.commission_type
            ? {
                type: row.commission_type,
                cph: Number(row.commission_cph),
              }
            : null,
          package: {
            id: row.package_id,
            durationMinutes: row.package_duration_minutes,
            pricePerStudent: row.package_price_per_student,
            capacityEquipment: row.package_capacity_equipment,
            categoryEquipment: row.package_category_equipment,
          },
          students: [],
          equipment: [],
        });
      }

      const transaction = transactionMap.get(eventId)!;

      // Add student if not already present
      if (row.student_id && !transaction.students.some((s) => s.id === row.student_id)) {
        transaction.students.push({
          id: row.student_id,
          firstName: row.student_first_name!,
          lastName: row.student_last_name!,
        });
      }

      // Add equipment if not already present
      if (row.equipment_model && !transaction.equipment.some((e) => e.model === row.equipment_model)) {
        transaction.equipment.push({
          model: row.equipment_model,
          size: row.equipment_size,
        });
      }
    }

    return Array.from(transactionMap.values());
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
