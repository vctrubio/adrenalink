import { getBookings } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import { BookingsTableClient } from "./BookingsTableClient";

export default async function BookingsPage() {
    const result = await getBookings();

    if (!result.success) {
        return (
            <>
                <InfoHeader title="Bookings" />
                <div>Error loading bookings</div>
            </>
        );
    }

    return (
        <>
            <InfoHeader title={`Bookings (${result.data.length})`} />
            <BookingsTableClient bookings={result.data} />
        </>
    );
}
