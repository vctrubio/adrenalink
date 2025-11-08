import { ActiveBookingStatsList } from "@/src/components/booking/ActiveBookingStatsList";
import { getActiveBookingsWithStats } from "@/getters/booking-stats-sql";

export default async function StatsPage() {
	const activeBookings = await getActiveBookingsWithStats();

	return (
		<div className="px-4 py-6">
			{/* Page Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-foreground mb-2">
					Active Bookings <span className="text-muted-foreground text-2xl">({activeBookings.length})</span>
				</h1>
				<p className="text-muted-foreground">Monitor active bookings, student progress, and teacher assignments</p>
			</div>

			{/* Active Bookings List */}
			<ActiveBookingStatsList bookings={activeBookings} />
		</div>
	);
}
