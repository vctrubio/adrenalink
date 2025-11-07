"use client";

import { RowPopover, type PopoverItem } from "@/src/components/ui/row";
import { canBookingBeCompleted, getBookingCompletionPercentage } from "@/getters/bookings-getter";
import { ENTITY_DATA } from "@/config/entities";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import BookingToCompleteIcon from "@/public/appSvgs/BookingToCompleteIcon";
import type { BookingModel } from "@/backend/models";

interface BookingCompletionPopoverProps {
    booking: BookingModel;
}

export const BookingCompletionPopover = ({ booking }: BookingCompletionPopoverProps) => {
    const canComplete = canBookingBeCompleted(booking);

    if (canComplete) {
        return null;
    }

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const completionPercentage = getBookingCompletionPercentage(booking);

    const popoverItems: PopoverItem[] = [{
        id: booking.schema.id,
        icon: <BookingToCompleteIcon className="w-4 h-4" />,
        color: bookingEntity.color,
        label: `${completionPercentage}% Complete`,
    }];

    return <RowPopover items={popoverItems} />;
};
