import BookingIcon from "@/public/appSvgs/BookingIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import { TrendingUpDown } from "lucide-react";

interface BookingLessonRevenueBadgeProps {
    bookingCount: number;
    lessonCount: number;
    revenue: number;
}

export function BookingLessonRevenueBadge({ bookingCount, lessonCount, revenue }: BookingLessonRevenueBadgeProps) {
    return (
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
            <span className="inline-flex items-center gap-1">
                <BookingIcon size={12} /> {bookingCount}
            </span>
            <span className="inline-flex items-center gap-1">
                <LessonIcon size={12} /> {lessonCount}
            </span>
            <span className="inline-flex items-center gap-1">
                <TrendingUpDown size={12} className="text-success" /> {revenue}
            </span>
        </span>
    );
}