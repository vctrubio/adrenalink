"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { TeacherBookingTag, TeacherBookingCreateTag } from "@/src/components/tags";
import { BookingCompletionPopover } from "@/src/components/popover/BookingCompletionPopover";
import { ENTITY_DATA } from "@/config/entities";
import { BookingStats, getBookingDurationHours } from "@/getters/bookings-getter";
import { formatDate } from "@/getters/date-getter";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import type { BookingModel } from "@/backend/models";

export function calculateBookingGroupStats(bookings: BookingModel[]): StatItem[] {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const totalEvents = bookings.reduce((sum, booking) => sum + BookingStats.getEventsCount(booking), 0);
    const totalHours = bookings.reduce((sum, booking) => sum + BookingStats.getTotalHours(booking), 0);

    const totalMoneyIn = bookings.reduce((sum, booking) => sum + BookingStats.getMoneyIn(booking), 0);
    const totalMoneyOut = bookings.reduce((sum, booking) => sum + BookingStats.getMoneyOut(booking), 0);
    const netRevenue = totalMoneyIn - totalMoneyOut;
    const bankColor = netRevenue >= 0 ? "#10b981" : "#ef4444";

    return [
        { icon: <BookingIcon className="w-5 h-5" />, value: bookings.length, color: bookingEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: totalHours, color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(netRevenue), color: bankColor },
    ];
}

const BookingAction = ({ booking }: { booking: BookingModel }) => {
    const lessons = booking.relations?.lessons || [];

    const hasNoLesson = lessons.length === 0;

    return (
        <div className="flex flex-wrap gap-2">
            {hasNoLesson ? (
                <TeacherBookingCreateTag icon={<HeadsetIcon className="w-3 h-3" />} onClick={() => console.log("Assigning teacher...")} />
            ) : (
                <>
                    {lessons.map((lesson) => {
                        const teacher = lesson.teacher;
                        if (!teacher) return null;

                        return <TeacherBookingTag key={lesson.id} icon={<HeadsetIcon className="w-3 h-3" />} username={teacher.username} link={`/teachers/${teacher.username}`} />;
                    })}
                </>
            )}
        </div>
    );
};

interface BookingRowProps {
    item: BookingModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const BookingRow = ({ item: booking, isExpanded, onToggle }: BookingRowProps) => {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const BookingIconComponent = bookingEntity.icon;
    const entityColor = bookingEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;
    const packageDesc = schoolPackage?.description || "No package";

    const bookingStudents = booking.relations?.bookingStudents || [];
    const studentNames = bookingStudents.map(bs => bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown").join(", ");

    const strItems = [
        { label: "Students", value: studentNames || "No students" },
        { label: "Created", value: formatDate(booking.schema.createdAt) },
        { label: "Start", value: formatDate(booking.schema.dateStart) },
        { label: "End", value: formatDate(booking.schema.dateEnd) },
        { label: "Package", value: packageDesc },
    ];

    const revenue = BookingStats.getRevenue(booking);
    const bankColor = revenue >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <FlagIcon className="w-5 h-5" />, value: BookingStats.getEventsCount(booking), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: BookingStats.getTotalHours(booking), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(revenue), color: bankColor },
    ];

    return (
        <Row
            id={booking.schema.id}
            entityData={booking}
            entityBgColor={bookingEntity.bgColor}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <BookingIconComponent className="w-10 h-10" />
                    </div>
                ),
                name: `Booking ${booking.schema.id.slice(0, 8)}`,
                status: `Status: ${booking.schema.status}`,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<BookingAction booking={booking} />}
            popover={<BookingCompletionPopover booking={booking} />}
            stats={stats}
        />
    );
};
