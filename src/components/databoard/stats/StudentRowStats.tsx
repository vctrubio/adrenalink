import { ENTITY_DATA } from "@/config/entities";
import { StudentStats as StudentStatsGetter } from "@/getters/students-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { calculateLessonRevenue } from "@/getters/commission-calculator";
import { transformEventsToRows } from "@/getters/event-getter";
import { TrendingUp } from "lucide-react";
import type { StatItem } from "@/src/components/ui/row";
import type { StudentModel } from "@/backend/models";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

export const StudentRowStats = {
	getStats: (items: StudentModel | StudentModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const students = isArray ? items : [items];

		const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
		const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

		const totalBookings = students.reduce((sum, student) => sum + StudentStatsGetter.getBookingsCount(student), 0);

		let totalEvents = 0;
		let totalDurationMinutes = 0;
		let totalSchoolRevenue = 0;

		for (const student of students) {
			const bookingStudents = student.relations?.bookingStudents || [];
			for (const bs of bookingStudents) {
				const booking = bs.booking;
				if (!booking) continue;

				const lessons = booking.lessons || [];
				for (const lesson of lessons) {
					const events = lesson.events || [];
					totalEvents += events.length;

					const schoolPackage = booking.studentPackage?.schoolPackage;
					const studentCount = booking.bookingStudents?.length || 1;
					const pricePerStudent = schoolPackage?.pricePerStudent || 0;
					const packageDurationMinutes = schoolPackage?.durationMinutes || 60;

					const eventRows = transformEventsToRows(events);
					for (const eventRow of eventRows) {
						totalDurationMinutes += eventRow.duration;
						const eventRevenue = calculateLessonRevenue(pricePerStudent, studentCount, eventRow.duration, packageDurationMinutes);
						totalSchoolRevenue += eventRevenue;
					}
				}
			}
		}

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push({ icon: <HelmetIcon className="w-5 h-5" />, value: students.length, label: "Students", color: studentEntity.color });
		}

		if (totalBookings > 0) {
			stats.push({ icon: <BookingIcon className="w-5 h-5" />, value: totalBookings, label: "Bookings", color: bookingEntity.color });
		}

		if (totalEvents > 0) {
			stats.push({ icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, label: "Events", color: eventEntity.color });
		}

		if (totalDurationMinutes > 0) {
			stats.push({ icon: <DurationIcon className="w-5 h-5" />, value: getFullDuration(totalDurationMinutes), label: "Duration", color: "#4b5563" });
		}

		if (totalSchoolRevenue > 0) {
			stats.push({
				icon: <TrendingUp size={20} />,
				value: getCompactNumber(totalSchoolRevenue),
				label: "Revenue",
				color: "rgb(251, 146, 60)"
			});
		}

		return stats;
	},
};
