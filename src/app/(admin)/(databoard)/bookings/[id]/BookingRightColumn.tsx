import type { BookingModel } from "@/backend/models";
import { BookingContainer } from "@/src/components/ids/BookingContainer";
import { BookingStatsColumns } from "./BookingStatsColumns";

interface BookingRightColumnProps {
    booking: BookingModel;
}

export function BookingRightColumn({ booking }: BookingRightColumnProps) {
    return (
        <>
            <BookingStatsColumns booking={booking} />
            <BookingContainer booking={booking} />
        </>
    );
}

