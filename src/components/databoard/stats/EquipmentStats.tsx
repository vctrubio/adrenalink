import { EquipmentDataboard } from "@/getters/databoard-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { EquipmentModel } from "@/backend/models";

export const EquipmentStats = {
	getStats: (items: EquipmentModel | EquipmentModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const equipments = isArray ? items : [items];

		// Aggregated stats using EquipmentDataboard
		const totalLessons = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getLessonCount(equipment), 0);
		const totalEvents = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getEventCount(equipment), 0);
		const totalDurationMinutes = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getDurationMinutes(equipment), 0);
		const totalProfit = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getProfit(equipment), 0);

		// Equipment page shows: Lessons, Events, Duration, Profit
		const stats: StatItem[] = [];

		if (includeCount) {
			const equipmentStat = createStat("equipment", equipments.length, "Equipments");
			if (equipmentStat) stats.push(equipmentStat);
		}

		const lessonsStat = createStat("lessons", totalLessons, "Lessons");
		if (lessonsStat) stats.push(lessonsStat);

		const eventsStat = createStat("events", totalEvents, "Events");
		if (eventsStat) stats.push(eventsStat);

		const durationStat = createStat("duration", totalDurationMinutes, "Duration");
		if (durationStat) stats.push(durationStat);

		const profitStat = createStat("profit", totalProfit, "Profit");
		if (profitStat) stats.push(profitStat);

		return stats;
	},
};
