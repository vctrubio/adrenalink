"use client";

import Link from "next/link";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getProgressBarColor } from "@/types/status";
import { TLETab } from "./TLETab";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface ActiveBookingTabProps {
	booking: ActiveBookingModel;
}

// Progress bar sub-component
const BookingProgressBar = ({ completedMinutes, events, booking }: { completedMinutes: number; events: any[]; booking: ActiveBookingModel }) => {
	const progressPercent = Math.min((completedMinutes / booking.package.durationMinutes) * 100, 100);
	const progressColor = getProgressBarColor(events);
	const packageEntityConfig = ENTITY_DATA.find((e) => e.id === "schoolPackage");
	const packageColor = packageEntityConfig?.color;
	const totalRevenue = booking.package.pricePerStudent * booking.students.length;

	return (
		<div className="flex items-center gap-3 flex-1">
			<div className="h-3 bg-muted rounded-full overflow-hidden flex-1 relative">
				<div
					className="h-full transition-all duration-300"
					style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
				/>
				<div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium translate-x-1">
					{getPrettyDuration(completedMinutes)}
				</div>
			</div>
			<div className="flex items-center gap-1">
				<div style={{ color: packageColor }}>
					<PackageIcon size={16} />
				</div>
				<div className="text-xs font-semibold text-foreground">{getPrettyDuration(booking.package.durationMinutes)}</div>
				<div className="text-xs text-muted-foreground">/</div>
				<div className="text-xs font-semibold text-foreground">${Math.round(totalRevenue * 100) / 100}</div>
			</div>
		</div>
	);
};

export const ActiveBookingTab = ({ booking }: ActiveBookingTabProps) => {
	// Get equipment icon and color based on category
	const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === booking.package.categoryEquipment);
	const EquipmentIcon = equipmentConfig?.icon;
	const equipmentColor = equipmentConfig?.color;

	// Get entity colors for styling
	const studentEntityConfig = ENTITY_DATA.find((e) => e.id === "student");
	const studentColor = studentEntityConfig?.color;

	// Format dates
	const dateStart = new Date(booking.dateStart).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "2-digit",
	});

	const dateEnd = new Date(booking.dateEnd).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "2-digit",
	});

	// Generate helmet icons for student capacity
	const studentCapacity = booking.package.capacityStudents;
	const studentCount = booking.students.length;
	const helmets = Array.from({ length: studentCapacity }, (_, i) => i < studentCount);

	const completedMinutes = booking.totalEventDuration;

	return (
		<div className="space-y-3">
			{/* Main Booking Row */}
			<div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/20 transition-colors">
				<div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-4">
					{/* Left Section: Head Structure with Equipment Icon and Dates */}
					<div className="flex items-center gap-4 flex-shrink-0">
						{/* Equipment Avatar/Icon */}
						<div className="flex-shrink-0 p-2 border border-border rounded-lg" style={{ color: equipmentColor }}>
							{EquipmentIcon && <EquipmentIcon width={32} height={32} />}
						</div>

						{/* Head Content: Dates and Helmet Indicator */}
						<div>
							{/* Dates - like name */}
							<div className="text-base font-semibold text-foreground">
								{dateStart} - {dateEnd}
							</div>

							{/* Helmet Icons - student capacity indicator */}
							<div className="mt-2 flex gap-1">
								{helmets.map((isFilled, index) => (
									<div key={index} style={{ color: isFilled ? studentColor : "#d1d5db" }} className="opacity-70 hover:opacity-100 transition-opacity">
										<HelmetIcon size={16} />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Student Names - full width below head on mobile */}
				<div className="mt-3 text-xs flex flex-wrap gap-1.5">
					{booking.students.map((student) => (
						<Link
							key={student.id}
							href={`/students/${student.id}`}
							className="px-2 py-1 rounded text-foreground font-medium hover:bg-accent/40 transition-colors"
						>
							{student.firstName} {student.lastName}
						</Link>
					))}
				</div>

				{/* Progress Bar - full width */}
				<div className="mt-3 lg:mt-0">
					<BookingProgressBar completedMinutes={completedMinutes} events={booking.events} booking={booking} />
				</div>
			</div>

			{/* Teachers List - each teacher has collapsible events */}
			{booking.events.length > 0 && (
				<TLETab booking={booking} isCollapsed={false} />
			)}
		</div>
	);
};
