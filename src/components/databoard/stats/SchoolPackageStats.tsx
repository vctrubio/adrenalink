import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { SchoolPackageModel } from "@/backend/models";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { BookmarkIcon } from "lucide-react";

export const SchoolPackageStats = {
	getStats: (items: SchoolPackageModel | SchoolPackageModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const packages = isArray ? items : [items];

		const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
		const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

		const totalPackages = packages.length;
		const totalStudents = packages.reduce((sum, pkg) => sum + (pkg.stats?.student_count || 0), 0);
		const totalEvents = packages.reduce((sum, pkg) => sum + (pkg.stats?.events_count || 0), 0);
		const totalMinutes = packages.reduce((sum, pkg) => sum + (pkg.stats?.total_duration_minutes || 0), 0);
		const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.stats?.money_in || 0), 0);

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push({ icon: <BookmarkIcon className="w-5 h-5" />, value: totalPackages, label: "Packages", color: packageEntity.color });
		}

		stats.push(
			{ icon: <HelmetIcon className="w-5 h-5" />, value: totalStudents, label: "Students", color: studentEntity.color },
			{ icon: <BankIcon className="w-5 h-5" />, value: totalRevenue, label: "Revenue", color: "#10b981" }
		);

		return stats;
	},
};
