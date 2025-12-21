import { ENTITY_DATA } from "@/config/entities";
import { EquipmentStats as EquipmentStatsGetter } from "@/getters/equipments-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { EquipmentModel } from "@/backend/models";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";

export const EquipmentStats = {
	getStats: (items: EquipmentModel | EquipmentModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const equipments = isArray ? items : [items];

		const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

		const totalEvents = equipments.reduce((sum, equipment) => sum + EquipmentStatsGetter.getEventsCount(equipment), 0);
		const totalMinutes = equipments.reduce((sum, equipment) => sum + (equipment.stats?.total_duration_minutes || 0), 0);
		const totalRentals = equipments.reduce((sum, equipment) => sum + EquipmentStatsGetter.getRentalsCount(equipment), 0);
		const totalMoneyIn = equipments.reduce((sum, equipment) => sum + EquipmentStatsGetter.getMoneyIn(equipment), 0);
		const totalMoneyOut = equipments.reduce((sum, equipment) => sum + EquipmentStatsGetter.getMoneyOut(equipment), 0);
		const netRevenue = totalMoneyIn - totalMoneyOut;
		const bankColor = netRevenue >= 0 ? "#10b981" : "#ef4444";

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push({ icon: <EquipmentIcon className="w-5 h-5" />, value: equipments.length, label: "Equipment", color: equipmentEntity.color });
		}

		stats.push(
			{ icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, label: "Events", color: eventEntity.color },
			{ icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), label: "Duration", color: "#4b5563" },
			{ icon: <HelmetIcon className="w-5 h-5" />, value: totalRentals, label: "Rentals", color: "#ef4444" },
			{ icon: <BankIcon className="w-5 h-5" />, value: Math.abs(Math.round(netRevenue)), label: "Revenue", color: bankColor }
		);

		return stats;
	},
};
