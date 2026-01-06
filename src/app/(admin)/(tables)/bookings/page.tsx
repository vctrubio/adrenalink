import { getBookingsTable } from "@/supabase/server/bookings";
import { BookingsTable } from "./BookingsTable";

export default async function BookingsMasterTablePage() {
    const bookings = await getBookingsTable();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Bookings Master Table</h1>
                <p className="text-muted-foreground">Comprehensive view of all school bookings and their status.</p>
            </div>
            
            <BookingsTable bookings={bookings} />
        </div>
    );
}
