import type { SchoolPackageType, EquipmentType } from "@/drizzle/schema";

export function getEquipmentForNow(
  categoryEquipment: string,
  capacityEquipment: number,
  equipmentList?: { model: string; size?: number | null }[],
): string {
  // If equipment was actually used (relations exist)
  if (equipmentList && equipmentList.length > 0) {
    return equipmentList.map((eq) => `${eq.model}${eq.size ? ` ${eq.size}` : ""}`).join(", ");
  }

  // Fall back to package equipment category
  if (capacityEquipment > 1) {
    return `${categoryEquipment} (x${capacityEquipment})`;
  }

  return categoryEquipment;
}

export function getTeacherCommission(
  commissionType: "fixed" | "percentage",
  cph: number,
  durationMinutes: number,
): number {
  const hours = durationMinutes / 60;

  if (commissionType === "fixed") {
    return Math.round(cph * hours * 100) / 100;
  }

  // For percentage, cph is actually a percentage value
  return Math.round(cph * hours * 100) / 100;
}

export function getSchoolRevenue(
  pricePerStudent: number,
  studentCount: number,
  durationMinutes: number,
  packageDurationMinutes: number,
): number {
  const totalPrice = pricePerStudent * studentCount;
  const hoursUsed = durationMinutes / 60;
  const packageHours = packageDurationMinutes / 60;
  const pricePerHour = totalPrice / packageHours;

  return Math.round(pricePerHour * hoursUsed * 100) / 100;
}

export function getSchoolLeftover(totalRevenue: number, teacherCommission: number): number {
  return Math.round((totalRevenue - teacherCommission) * 100) / 100;
}

export function getStudentNames(students: { firstName: string; lastName: string }[]): string {
  return students.map((s) => `${s.firstName} ${s.lastName}`).join(", ");
}

export function formatTimeFromDate(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateFromTimestamp(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}
