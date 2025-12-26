import { getBookings } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { bookingRenderers, calculateBookingGroupStats } from "@/src/components/databoard/rows/BookingRow";

export default async function BookingsPage() {
    const result = await getBookings();

    if (!result.success) {
        return <div>Error loading bookings: {result.error}</div>;
    }

    return <DataboardPageClient entityId="booking" data={result.data} renderers={bookingRenderers} calculateStats={calculateBookingGroupStats} />;
}
