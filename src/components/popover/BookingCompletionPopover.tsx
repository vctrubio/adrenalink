"use client";

import { RowPopover, type PopoverItem } from "@/src/components/ui/row";
import { canBookingBeCompleted } from "@/getters/bookings-getter";
import { getEventStatusCounts, getProgressColor } from "@/getters/booking-progress-getter";
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
    const bookingEvents = lessons.flatMap((l) => l.events || []);
    const counts = getEventStatusCounts(bookingEvents as any);
    const progressBarStyle = getProgressColor(counts, packageInfo.durationMinutes);

    const totalUsedMinutes = (counts.completed || 0) + (counts.uncompleted || 0) + (counts.planned || 0) + (counts.tbc || 0);
    const denominator = totalUsedMinutes > packageInfo.durationMinutes ? totalUsedMinutes : packageInfo.durationMinutes;
    const completedEnd = denominator > 0 ? (counts.completed / denominator) * 100 : 0;

    const popoverItems: PopoverItem[] = [{
        id: booking.schema.id,
        icon: <BookingToCompleteIcon className="w-4 h-4" />,
        color: bookingEntity.color,
        label: (
            <div className="w-full">
                <div className="text-xs font-medium mb-1">Booking Progress</div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: progressBarStyle }} />
                <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(completedEnd)}% Complete
                </div>
            </div>
        ),
    }];

    return <RowPopover items={popoverItems} />;
};
