import type { RegisterTables } from "@/supabase/server/register";

/**
 * Update student and teacher stats after booking submission
 * Increments bookingCount for students and totalLessons for teacher
 */
export function updateStudentTeacherStatsAfterBooking(
  currentStats: any,
  studentIds: string[],
  teacherId?: string
) {
  const updatedStats = { ...currentStats };

  // Increment booking count for each student
  studentIds.forEach((studentId) => {
    if (updatedStats.studentBookingStats?.[studentId]) {
      updatedStats.studentBookingStats[studentId].bookingCount += 1;
    }
  });

  return updatedStats;
}
