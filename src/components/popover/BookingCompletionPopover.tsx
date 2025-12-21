"use client";

import { RowPopover, type PopoverItem } from "@/src/components/ui/row";
import { canBookingBeCompleted } from "@/getters/bookings-getter";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import { ENTITY_DATA } from "@/config/entities";
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
    const lessons = booking.relations?.lessons || [];
    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;

    if (!schoolPackage) {
        return null;
    }

    const packageInfo = getPackageInfo(schoolPackage, lessons);
    const progressBarStyle = getBookingProgressBar(lessons, packageInfo.durationMinutes);

    const popoverItems: PopoverItem[] = [{
        id: booking.schema.id,
        icon: <BookingToCompleteIcon className="w-4 h-4" />,
        color: bookingEntity.color,
        label: (
            <div className="w-full">
                <div className="text-xs font-medium mb-1">Booking Progress</div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={progressBarStyle} />
                <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(progressBarStyle.completedEnd)}% Complete
                </div>
            </div>
        ),
    }];

    return <RowPopover items={popoverItems} />;
};
