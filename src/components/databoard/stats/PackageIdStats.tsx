import type { StatItem } from "@/src/components/ui/row";
import { createStat } from "./stat-factory";
import { getPackageIdStats } from "@/getters/databoard-sql-packages";

export const PackageIdStats = {
    getStatsByModel: (stats: { student_count: number; events_count: number; total_duration_minutes: number; money_in: number }): StatItem[] => {
        const studentCount = stats.student_count || 0;
        const eventsCount = stats.events_count || 0;
        const durationMinutes = stats.total_duration_minutes || 0;
        const revenue = stats.money_in || 0;

        const statItems: StatItem[] = [];

        if (studentCount !== 0) {
            const stat = createStat("student", studentCount, "Students");
            if (stat) statItems.push(stat);
        }

        if (eventsCount !== 0) {
            const stat = createStat("events", eventsCount, "Events");
            if (stat) statItems.push(stat);
        }

        if (durationMinutes !== 0) {
            const stat = createStat("duration", durationMinutes);
            if (stat) statItems.push(stat);
        }

        if (revenue !== 0) {
            const stat = createStat("revenue", revenue);
            if (stat) statItems.push(stat);
        }

        return statItems;
    },

    getStats: async (packageId: string): Promise<StatItem[]> => {
        const stats = await getPackageIdStats(packageId);
        return PackageIdStats.getStatsByModel(stats);
    }
};

