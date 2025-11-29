import { calculateStudentGroupStats } from "@/src/components/databoard/rows/StudentRow";
import { calculateTeacherGroupStats } from "@/src/components/databoard/rows/TeacherRow";
import { calculateBookingGroupStats } from "@/src/components/databoard/rows/BookingRow";
import { calculateEquipmentGroupStats } from "@/src/components/databoard/rows/EquipmentRow";
import { calculateEventGroupStats } from "@/src/components/databoard/rows/EventRow";
import { calculateStudentPackageGroupStats } from "@/src/components/databoard/rows/StudentPackageRow";
import { calculateSchoolPackageGroupStats } from "@/src/components/databoard/rows/SchoolPackageRow";
import type { StatItem } from "@/src/components/ui/row";

export const DATABOARD_STATS_REGISTRY: Record<string, (data: any[]) => StatItem[]> = {
  student: calculateStudentGroupStats,
  teacher: calculateTeacherGroupStats,
  booking: calculateBookingGroupStats,
  equipment: calculateEquipmentGroupStats,
  event: calculateEventGroupStats,
  studentPackage: calculateStudentPackageGroupStats,
  schoolPackage: calculateSchoolPackageGroupStats,
  rental: () => [],
  referral: () => [],
};

export function getStatsForEntity(entityId: string, data: any[]): StatItem[] {
  const statsFunc = DATABOARD_STATS_REGISTRY[entityId];
  return statsFunc ? statsFunc(data) : [];
}
