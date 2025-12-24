"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherBookingTag, TeacherBookingCreateTag } from "@/src/components/tags";
import { BookingCompletionPopover } from "@/src/components/popover/BookingCompletionPopover";
import { BookingStats as DataboardBookingStats } from "@/src/components/databoard/stats";
import { formatDate } from "@/getters/date-getter";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import { updateBooking } from "@/actions/bookings-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { BookingModel } from "@/backend/models";
import { BookingDropdownRow } from "./BookingDropdownRow";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getFullDuration } from "@/getters/duration-getter";
import PPHIcon from "@/public/appSvgs/PPHIcon";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";

export const calculateBookingGroupStats = DataboardBookingStats.getStats;

const BookingAction = ({ booking }: { booking: BookingModel }) => {
    const lessons = booking.relations?.lessons || [];

    const hasNoLesson = lessons.length === 0;

    return (
        <div className="flex flex-wrap gap-2">
            {hasNoLesson ? (
                <TeacherBookingCreateTag icon={<HeadsetIcon className="w-4 h-4" />} onClick={() => console.log("Assigning teacher...")} />
            ) : (
                <>
                    {lessons.map((lesson) => {
                        const teacher = lesson.teacher;
                        if (!teacher) return null;

                        const events = lesson.events || [];
                        const totalMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);
                        const duration = getFullDuration(totalMinutes);

                        return (
                            <TeacherBookingTag 
                                key={lesson.id} 
                                icon={<HeadsetIcon className="w-4 h-4" />} 
                                username={teacher.username} 
                                link={`/teachers/${teacher.username}`}
                                duration={duration}
                                eventCount={events.length}
                            />
                        );
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

    const BookingIconComponent = bookingEntity.icon;
    const entityColor = bookingEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;
    const packageDesc = schoolPackage?.description || "No package";

    const bookingStudents = booking.relations?.bookingStudents || [];
    const studentNames = bookingStudents.map((bs) => (bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown"));

    const strItems = [
        {
            label: "Students",
            			value: (
            				<div className="flex flex-col">
            					{studentNames.length > 0 ? (
            						studentNames.map((name, index) => <span key={index}>{name}</span>)
            					) : (
            						<span>No students</span>
            					)}
            				</div>
            			),
        },
        { label: "Created", value: formatDate(booking.schema.createdAt) },
        { label: "Start", value: formatDate(booking.schema.dateStart) },
        { label: "End", value: formatDate(booking.schema.dateEnd) },
        { label: "Package", value: packageDesc },
    ];

    const stats = DataboardBookingStats.getStats(booking, false);

    const currentStatus = booking.schema.status;
    const currentStatusConfig = BOOKING_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (["active", "completed", "uncompleted"] as const).map((status) => ({
        id: status,
        label: BOOKING_STATUS_CONFIG[status].label,
        icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BOOKING_STATUS_CONFIG[status].color }} />,
        color: BOOKING_STATUS_CONFIG[status].color,
        onClick: () => updateBooking(booking.schema.id, { status: status as BookingStatus }),
    }));

    const equipmentCategory = EQUIPMENT_CATEGORIES.find((cat) => cat.id === schoolPackage?.categoryEquipment);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const equipmentCapacity = schoolPackage?.capacityEquipment || 0;
    const actualStudents = bookingStudents.length || 0;
    const studentCapacity = schoolPackage?.capacityStudents || 0;
    const packageDurationHours = schoolPackage?.durationMinutes ? Math.round(schoolPackage.durationMinutes / 60) : 0;
    const durationHours = schoolPackage?.durationMinutes ? schoolPackage.durationMinutes / 60 : 0;
    const pricePerHour = durationHours > 0 ? (schoolPackage?.pricePerStudent || 0) / durationHours : 0;

    const EquipmentIcon = equipmentCategory?.icon;
    const StudentIcon = studentEntity.icon;
    const PackageIcon = packageEntity.icon;

    return (
        <Row
            id={booking.schema.id}
            entityData={booking.schema}
            entityBgColor={bookingEntity.bgColor}
            entityColor={bookingEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            expandedContent={<BookingDropdownRow item={booking} />}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        {EquipmentIcon ? <EquipmentIcon className="w-10 h-10" /> : <BookingIconComponent className="w-10 h-10" />}
                    </div>
                ),
                name: (
                    <HoverToEntity entity={bookingEntity} id={booking.schema.id}>
                        {booking.schema.leaderStudentName || `Booking ${booking.schema.id.slice(0, 8)}`}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: (
                    <EquipmentStudentPackagePriceBadge 
                        categoryIcon={EquipmentIcon}
                        equipmentCapacity={equipmentCapacity}
                        studentCapacity={studentCapacity}
                        packageDurationHours={packageDurationHours}
                        packageIcon={PackageIcon}
                        packageColor={packageEntity.color}
                        pricePerHour={pricePerHour}
                    />
                ),
                items: strItems,
            }}
            action={<BookingAction booking={booking} />}
            popover={<BookingCompletionPopover booking={booking} />}
            stats={stats}
        />
    );
};

