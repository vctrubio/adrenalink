import { EquipmentDataboard } from "@/getters/databoard-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { EquipmentModel } from "@/backend/models";

export const EquipmentStats = {
	getStats: (items: EquipmentModel | EquipmentModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const equipments = isArray ? items : [items];

		// Aggregate stats across all equipment using databoard-getter
		const totalEvents = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getEventCount(equipment), 0);
		const totalRentals = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getRentalsCount(equipment), 0);
		const totalNet = equipments.reduce((sum, equipment) => sum + EquipmentDataboard.getMoneyIn(equipment), 0);

		// Build stats using stat-factory as single source of truth
		// Equipment page shows: Equipment count, Events, Rentals, Net (money in)
		const stats: StatItem[] = [];

		if (includeCount) {
			const equipmentStat = createStat("equipment", equipments.length, "Equipment");
			stats.push(equipmentStat!);
		}

		const eventsStat = createStat("events", totalEvents, "Events");
		stats.push(eventsStat!);

		const rentalsStat = createStat("rentals", totalRentals, "Rentals");
		stats.push(rentalsStat!);

		const netStat = createStat("schoolNet", totalNet, "Net");
		stats.push(netStat!);

		return stats;
	},
};
