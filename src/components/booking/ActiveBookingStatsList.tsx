"use client";

import { ActiveBookingTab } from "@/src/components/tabs/ActiveBookingTab";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface ActiveBookingStatsListProps {
	bookings: ActiveBookingModel[];
	onReload?: () => void;
}

export const ActiveBookingStatsList = ({ bookings, onReload }: ActiveBookingStatsListProps) => {
	// Calculate unique students across all active bookings
	const uniqueStudentIds = new Set<string>();
	bookings.forEach((booking) => {
		booking.students.forEach((student) => {
			uniqueStudentIds.add(student.id);
		});
	});

	// Calculate total unique teachers across all bookings
	const totalUniqueTeachers = bookings.reduce((sum, booking) => sum + booking.uniqueTeacherCount, 0);

	return (
		<div className="space-y-6">
			{/* Top Metrics */}
			<div className="grid grid-cols-2 gap-4">
				{/* Students Metric */}
				<div className="bg-card border border-border rounded-lg p-4">
					<div className="flex items-center gap-3 mb-2">
						<div className="text-2xl">⛑</div>
						<div className="text-sm font-semibold text-muted-foreground">Students</div>
					</div>
					<div className="text-3xl font-bold text-foreground">{uniqueStudentIds.size}</div>
				</div>

				{/* Teachers Metric */}
				<div className="bg-card border border-border rounded-lg p-4">
					<div className="flex items-center gap-3 mb-2">
						<div className="text-2xl">🎧</div>
						<div className="text-sm font-semibold text-muted-foreground">Teachers</div>
					</div>
					<div className="text-3xl font-bold text-foreground">{totalUniqueTeachers}</div>
				</div>
			</div>

			{/* Reload Button */}
			{onReload && (
				<div className="flex justify-end">
					<button
						onClick={onReload}
						className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-semibold transition-colors"
					>
						Reload
					</button>
				</div>
			)}

			{/* Bookings List - One per row */}
			<div className="space-y-3 max-w-full">
				{bookings.length > 0 ? (
					bookings.map((booking) => <ActiveBookingTab key={booking.id} booking={booking} />)
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No active bookings at the moment</p>
					</div>
				)}
			</div>
		</div>
	);
};
