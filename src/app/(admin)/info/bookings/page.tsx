import { getBookings } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import Link from "next/link";

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

    const bookings = result.data;

    return (
        <>
            <InfoHeader title="Bookings" />
            <div className="flex flex-col gap-2">
                {bookings.map((booking) => (
                    <Link
                        key={booking.schema.id}
                        href={`/info/bookings/${booking.schema.id}`}
                        className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h3 className="font-semibold">{booking.schema.leaderStudentName}</h3>
                    </Link>
                ))}
            </div>
        </>
    );
}
