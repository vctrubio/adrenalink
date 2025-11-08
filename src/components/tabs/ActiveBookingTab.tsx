"use client";

import { useState } from "react";
import Link from "next/link";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { TLETab } from "./TLETab";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface ActiveBookingTabProps {
	booking: ActiveBookingModel;
}

// Progress bar sub-component
// Note: Progress bar color reflects event status colors (grey=planned, purple=tbc, green=completed, orange=uncompleted)
// The dominant status color is determined by the most recent or primary event status
const BookingProgressBar = ({ completedMinutes, totalMinutes, totalRevenue, events }: { completedMinutes: number; totalMinutes: number; totalRevenue: number; events?: any[] }) => {
	const progressPercent = Math.min((completedMinutes / totalMinutes) * 100, 100);

	// Determine progress bar color based on event statuses
	// Priority: completed > tbc > uncompleted > planned
	let progressColor = "bg-primary"; // default primary color
	if (events && events.length > 0) {
		const statusPriority = { completed: 4, tbc: 3, uncompleted: 2, planned: 1 };
		const dominantStatus = events.reduce((max, evt) => {
			const maxPriority = statusPriority[max.status as keyof typeof statusPriority] || 0;
			const evtPriority = statusPriority[evt.status as keyof typeof statusPriority] || 0;
			return evtPriority > maxPriority ? evt : max;
		}).status;

		const statusColorMap = {
			planned: "#9ca3af",
			tbc: "#a855f7",
			completed: "#86efac",
			uncompleted: "#fbbf24",
		};
		progressColor = statusColorMap[dominantStatus as keyof typeof statusColorMap] || "bg-primary";
	}

	return (
		<div className="flex items-center gap-3 flex-1">
			<div className="h-2 bg-muted rounded-full overflow-hidden flex-1 relative">
				<div
					className="h-full transition-all duration-300"
					style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
				/>
				<div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium translate-x-1">
					{getPrettyDuration(completedMinutes)}
				</div>
			</div>
			<div className="flex items-center gap-1">
				<div className="text-xs font-semibold text-foreground">{getPrettyDuration(totalMinutes)}</div>
				<div className="text-xs text-muted-foreground">/</div>
				<div className="text-xs font-semibold text-foreground">${Math.round(totalRevenue * 100) / 100}</div>
			</div>
		</div>
	);
};

export const ActiveBookingTab = ({ booking }: ActiveBookingTabProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	// Get equipment icon based on category
	const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === booking.package.categoryEquipment);
	const EquipmentIcon = equipmentConfig?.icon;

	// Get student entity config for styling
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

	// Progress data
	const completedMinutes = booking.totalEventDuration;
	const totalMinutes = booking.package.durationMinutes;
	const totalRevenue = booking.package.pricePerStudent * booking.students.length;

	return (
		<div className="space-y-3">
			{/* Main Booking Row */}
			<div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/20 transition-colors">
				<div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-4">
					{/* Left Section: Head Structure with Equipment Icon and Dates */}
					<div className="flex items-center gap-4 flex-shrink-0">
						{/* Equipment Avatar/Icon */}
						<div className="flex-shrink-0">
							{EquipmentIcon && <EquipmentIcon width={32} height={32} />}
						</div>

						{/* Head Content: Dates and Helmet Indicator */}
						<div>
							{/* Dates - like name */}
							<div className="text-base font-semibold text-foreground">
								{dateStart} - {dateEnd}
							</div>

							{/* Large Helmet Icon below dates - to match teacher size */}
							<div className="mt-2">
								<HelmetIcon size={22} />
							</div>
						</div>
					</div>

					{/* Right Section: Teacher/Event Toggle Button - moved up for mobile */}
					<div className="flex-shrink-0 lg:order-last">
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex flex-col items-center gap-2 px-3 py-2 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors cursor-pointer h-fit w-full lg:w-auto justify-center"
						>
							<HeadsetIcon size={22} />
							<span className="text-xs font-semibold text-foreground">
								{booking.uniqueTeacherCount}
							</span>
						</button>
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
					<BookingProgressBar completedMinutes={completedMinutes} totalMinutes={totalMinutes} totalRevenue={totalRevenue} events={booking.events} />
				</div>
			</div>

			{/* Expandable Lesson/Event Section */}
			{isExpanded && booking.events.length > 0 && (
				<div className="bg-card border border-border rounded-lg p-4 ml-0 lg:ml-4">
					<TLETab booking={booking} isCollapsed={false} />
				</div>
			)}
		</div>
	);
};
