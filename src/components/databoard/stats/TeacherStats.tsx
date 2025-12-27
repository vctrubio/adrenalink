import { ENTITY_DATA } from "@/config/entities";
import { TeacherStats as TeacherStatsGetter } from "@/getters/teachers-getter";
import { getFullDuration, getPrettyDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { StatItem } from "@/src/components/ui/row";
import type { TeacherModel } from "@/backend/models";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

export const TeacherStats = {
	getStats: (items: TeacherModel | TeacherModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const teachers = isArray ? items : [items];

		const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
		const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
		const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");

		const totalLessons = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getLessonsCount(teacher), 0);
		const totalEvents = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getEventsCount(teacher), 0);
		const totalMinutes = teachers.reduce((sum, teacher) => sum + (teacher.stats?.total_duration_minutes || 0), 0);
		const totalCommissions = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getTotalCommissions(teacher), 0);
		const totalRevenue = teachers.reduce((sum, teacher) => sum + TeacherStatsGetter.getTotalRevenue(teacher), 0);

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push({ icon: <HeadsetIcon className="w-5 h-5" />, value: teachers.length, label: "Teachers", color: teacherEntity.color });
		}

		stats.push(
			{ icon: <LessonIcon className="w-5 h-5" />, value: totalLessons, label: "Lessons", color: lessonEntity.color },
			{ icon: <HandshakeIcon className="w-5 h-5" />, value: getCompactNumber(totalCommissions), label: "Commissions", color: commissionEntity?.color || "#a78bfa" },
			{
				icon: totalRevenue >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
				value: getCompactNumber(totalRevenue),
				label: "Revenue",
				color: "rgb(251, 146, 60)"
			}
		);

		return stats;
	},
};
