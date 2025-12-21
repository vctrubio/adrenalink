import { ENTITY_DATA } from "@/config/entities";
import { StudentStats as StudentStatsGetter } from "@/getters/students-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { StudentModel } from "@/backend/models";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const StudentStats = {
	getStats: (items: StudentModel | StudentModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const students = isArray ? items : [items];

		const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
		const requestEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
		const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

		const totalRequestedPackages = students.reduce((sum, student) => sum + StudentStatsGetter.getRequestedPackagesCount(student), 0);
		const totalBookings = students.reduce((sum, student) => sum + StudentStatsGetter.getBookingsCount(student), 0);
		const totalEvents = students.reduce((sum, student) => sum + StudentStatsGetter.getEventsCount(student), 0);
		const totalMinutes = students.reduce((sum, student) => sum + (student.stats?.total_duration_minutes || 0), 0);
		const totalMoneyIn = students.reduce((sum, student) => sum + StudentStatsGetter.getMoneyIn(student), 0);
		const totalMoneyOut = students.reduce((sum, student) => sum + StudentStatsGetter.getMoneyOut(student), 0);
		const netMoney = totalMoneyIn - totalMoneyOut;
		const bankColor = netMoney >= 0 ? "#10b981" : "#ef4444";

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push(
				{ icon: <HelmetIcon className="w-5 h-5" />, value: students.length, label: "Students", color: studentEntity.color },
				{ icon: <RequestIcon className="w-5 h-5" />, value: totalRequestedPackages, label: "Requests", color: requestEntity.color }
			);
		}

		stats.push(
			{ icon: <BookingIcon className="w-5 h-5" />, value: totalBookings, label: "Bookings", color: bookingEntity.color },
			{ icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, label: "Events", color: eventEntity.color },
			{ icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), label: "Duration", color: "#4b5563" },
			{ icon: <BankIcon className="w-5 h-5" />, value: Math.abs(netMoney), label: "Balance", color: bankColor }
		);

		return stats;
	},
};
