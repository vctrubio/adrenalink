import { ActiveBookingStatsList } from "@/src/components/booking/ActiveBookingStatsList";
import { getActiveBookingsWithStats } from "@/getters/booking-stats-sql";

export default async function StatsPage() {
    const activeBookings = await getActiveBookingsWithStats();

    return (
        <div className="px-4 py-6">
            {/* Active Bookings List */}
            <ActiveBookingStatsList bookings={activeBookings} />
        </div>
    );
}
