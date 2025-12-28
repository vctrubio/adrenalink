import { TeacherDataboard } from "@/getters/databoard-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { TeacherModel } from "@/backend/models";

export const TeacherStats = {
	getStats: (items: TeacherModel | TeacherModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const teachers = isArray ? items : [items];

		        // Aggregated stats using TeacherDataboard
		        const totalLessons = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getLessonCount(teacher), 0);
		        const totalCommission = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getCommission(teacher), 0);
		        const totalProfit = teachers.reduce((sum, teacher) => sum + TeacherDataboard.getProfit(teacher), 0);
		
		        // Teachers page shows: Lessons, Commission, Profit only
		        const stats: StatItem[] = [];
		
		        if (includeCount) {
		            const teacherStat = createStat("teacher", teachers.length, "Teachers");
		            if (teacherStat) stats.push(teacherStat);
		        }
		
		        const lessonsStat = createStat("lessons", totalLessons, "Lessons");
		        if (lessonsStat) stats.push(lessonsStat);
		
		        const commissionStat = createStat("commission", totalCommission, "Commission");
		        if (commissionStat) stats.push(commissionStat);
		
		        const profitStat = createStat("profit", totalProfit, "Profit");
		        if (profitStat) stats.push(profitStat);
		
		        return stats;
		    },
		};
