import { ActiveBookingStatsList } from "@/src/components/booking/ActiveBookingStatsList";
import { ActiveStudentBookingTab } from "@/src/components/tabs/ActiveStudentBookingTab";
import { getActiveBookingsWithStats } from "@/getters/booking-stats-sql";

export default async function StatsPage() {
    const activeBookings = await getActiveBookingsWithStats();

    return (
        <div className="px-4 py-6 space-y-8">
            {/* Active Bookings List */}
            <ActiveBookingStatsList bookings={activeBookings} />

            {/* Student Bookings - Newspaper Layout */}
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Student Bookings</h2>
                <div className="flex flex-col flex-wrap gap-4 max-h-[800px] overflow-x-auto">
                    {activeBookings.map((booking) => (
                        <ActiveStudentBookingTab key={booking.id} booking={booking} />
                    ))}
                </div>
            </div>
        </div>
    );
}
