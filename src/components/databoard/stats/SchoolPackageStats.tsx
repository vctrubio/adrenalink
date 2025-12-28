import { SchoolPackageDataboard } from "@/getters/databoard-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { SchoolPackageModel } from "@/backend/models";

export const SchoolPackageStats = {
	getStats: (items: SchoolPackageModel | SchoolPackageModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const packages = isArray ? items : [items];

		// Aggregate stats across all packages using databoard-getter
		const totalStudents = packages.reduce((sum, pkg) => sum + SchoolPackageDataboard.getStudentCount(pkg), 0);
		const totalRevenue = packages.reduce((sum, pkg) => sum + SchoolPackageDataboard.getRevenue(pkg), 0);

		// Build stats using stat-factory as single source of truth
		// Packages page shows: Students, Revenue (always positive)
		const stats: StatItem[] = [];

		if (includeCount) {
			const packageStat = createStat("package", packages.length, "Packages");
			if (packageStat) stats.push(packageStat);
		}

		const studentsStat = createStat("studentPackage", totalStudents, "Students");
		if (studentsStat) stats.push(studentsStat);

		const revenueStat = createStat("revenue", totalRevenue, "Revenue");
		if (revenueStat) stats.push(revenueStat);

		return stats;
	},
};
