import { TeacherDataboard } from "@/getters/databoard-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { TeacherModel } from "@/backend/models";

export const TeacherStats = {
	getStats: (items: TeacherModel | TeacherModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const teachers = isArray ? items : [items];

		// Aggregate stats across all teachers using databoard-getter
		const totalLessons = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getLessonCount(teacher), 0);
		const totalEvents = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getEventCount(teacher), 0);
		const totalDurationMinutes = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getDurationMinutes(teacher), 0);
		const totalCommission = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getCommission(teacher), 0);
		const totalRevenue = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getSchoolRevenue(teacher), 0);

		// Build stats using stat-factory as single source of truth
		// Teachers page shows: Lessons, Commission, Revenue only
		const stats: StatItem[] = [];

		if (includeCount) {
			const teacherStat = createStat("teacher", teachers.length, "Teachers");
			if (teacherStat) stats.push(teacherStat);
		}

		const lessonsStat = createStat("lessons", totalLessons, "Lessons");
		if (lessonsStat) stats.push(lessonsStat);

		const commissionStat = createStat("commission", totalCommission, "Commission");
		if (commissionStat) stats.push(commissionStat);

		const revenueStat = createStat("revenue", totalRevenue, "Revenue");
		if (revenueStat) stats.push(revenueStat);

		return stats;
	},
};
