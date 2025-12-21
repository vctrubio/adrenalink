import { ENTITY_DATA } from "@/config/entities";
import { TeacherStats as TeacherStatsGetter } from "@/getters/teachers-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { TeacherModel } from "@/backend/models";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const TeacherStats = {
	getStats: (items: TeacherModel | TeacherModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const teachers = isArray ? items : [items];

		const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
		const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

		const totalLessons = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getLessonsCount(teacher), 0);
		const totalEvents = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getEventsCount(teacher), 0);
		const totalMinutes = teachers.reduce((sum, teacher) => sum + (teacher.stats?.total_duration_minutes || 0), 0);
		const totalMoneyEarned = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getMoneyEarned(teacher), 0);
		const bankColor = totalMoneyEarned >= 0 ? "#10b981" : "#ef4444";

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push({ icon: <HeadsetIcon className="w-5 h-5" />, value: teachers.length, label: "Teachers", color: teacherEntity.color });
		}

		stats.push(
			{ icon: <LessonIcon className="w-5 h-5" />, value: totalLessons, label: "Lessons", color: lessonEntity.color },
			{ icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, label: "Events", color: eventEntity.color },
			{ icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), label: "Duration", color: "#4b5563" },
			{ icon: <BankIcon className="w-5 h-5" />, value: Math.abs(totalMoneyEarned), label: "Earned", color: bankColor }
		);

		return stats;
	},
};
