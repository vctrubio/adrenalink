import { getBookings } from "@/actions/databoard-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { BookingRow } from "@/src/components/databoard/rows/BookingRow";

export default async function BookingsPage() {
    const result = await getBookings();

    if (!result.success) {
        return <div>Error loading bookings: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="booking" data={result.data} rowComponent={BookingRow} />
        </div>
    );
}
