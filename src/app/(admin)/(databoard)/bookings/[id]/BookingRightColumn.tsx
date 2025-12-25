import type { BookingModel } from "@/backend/models";
import { BookingContainer } from "@/src/components/ids/BookingContainer";

interface BookingRightColumnProps {
    booking: BookingModel;
}

export function BookingRightColumn({ booking }: BookingRightColumnProps) {
    return (
        <>
            <BookingContainer booking={booking} />
        </>
    );
}

