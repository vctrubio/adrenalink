"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { BookingTag, BookingCreateTag } from "@/src/components/tags";
import { StudentPackagePopover } from "@/src/components/popover/StudentPackagePopover";
import { ENTITY_DATA } from "@/config/entities";
import { StudentStats } from "@/getters/students-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { SCHOOL_STUDENT_STATUS_CONFIG, type SchoolStudentStatus } from "@/types/status";
import { updateSchoolStudentActive } from "@/actions/students-action";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import type { StudentModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export function calculateStudentGroupStats(students: StudentModel[]): StatItem[] {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const requestEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const totalRequestedPackages = students.reduce((sum, student) => sum + StudentStats.getRequestedPackagesCount(student), 0);
    const totalBookings = students.reduce((sum, student) => sum + StudentStats.getBookingsCount(student), 0);
    const totalEvents = students.reduce((sum, student) => sum + StudentStats.getEventsCount(student), 0);
    const totalMinutes = students.reduce((sum, student) => sum + (student.stats?.total_duration_minutes || 0), 0);

    const totalMoneyIn = students.reduce((sum, student) => sum + StudentStats.getMoneyIn(student), 0);
    const totalMoneyOut = students.reduce((sum, student) => sum + StudentStats.getMoneyOut(student), 0);
    const netMoney = totalMoneyIn - totalMoneyOut;
    const bankColor = netMoney >= 0 ? "#10b981" : "#ef4444";

    return [
        { icon: <HelmetIcon className="w-5 h-5" />, value: students.length, color: studentEntity.color },
        { icon: <RequestIcon className="w-5 h-5" />, value: totalRequestedPackages, color: requestEntity.color },
        { icon: <BookingIcon className="w-5 h-5" />, value: totalBookings, color: bookingEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(netMoney), color: bankColor },
    ];
}

const StudentAction = ({ student }: { student: StudentModel }) => {
    const bookingStudents = student.relations?.bookingStudents || [];

    return (
        <div className="flex flex-wrap gap-2">
            {bookingStudents.length === 0 ? (
                <BookingCreateTag icon={<BookingIcon className="w-3 h-3" />} onClick={() => console.log("Creating new booking...")} />
            ) : (
                <>
                    {bookingStudents.map((bookingStudent) => {
                        const booking = bookingStudent.booking;
                        if (!booking) return null;

                        return <BookingTag key={booking.id} icon={<BookingIcon className="w-3 h-3" />} dateStart={booking.dateStart} dateEnd={booking.dateEnd} status="active" link={`/bookings/${booking.id}`} />;
                    })}
                </>
            )}
        </div>
    );
};

interface StudentRowProps {
    item: StudentModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    onStatusChange?: () => void;
}

function validateActivity(fromStatus: SchoolStudentStatus, toStatus: SchoolStudentStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const StudentRow = ({ item: student, isExpanded, onToggle, onStatusChange }: StudentRowProps) => {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const StudentIcon = studentEntity.icon;
    const entityColor = studentEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const fullName = `${student.schema.firstName} ${student.schema.lastName}`;

    const strItems = [
        { label: "Passport", value: student.schema.passport },
        { label: "Country", value: student.schema.country },
        { label: "Phone", value: student.schema.phone },
        { label: "Languages", value: student.schema.languages.join(", ") },
        { label: "Joined", value: new Date(student.schema.createdAt).toLocaleDateString() },
    ];

    const moneyIn = StudentStats.getMoneyIn(student);
    const moneyOut = StudentStats.getMoneyOut(student);
    const netMoney = moneyIn - moneyOut;
    const bankColor = netMoney >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <BookingIcon className="w-5 h-5" />, value: StudentStats.getBookingsCount(student), color: bookingEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: StudentStats.getEventsCount(student), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(student.stats?.total_duration_minutes || 0), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(netMoney), color: bankColor },
    ];

    const isActive = student.updateForm.active;
    const currentStatus = isActive ? "active" : "inactive";
    const currentStatusConfig = SCHOOL_STUDENT_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (["active", "inactive"] as const).map((status) => ({
        id: status,
        label: SCHOOL_STUDENT_STATUS_CONFIG[status].label,
        icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCHOOL_STUDENT_STATUS_CONFIG[status].color }} />,
        color: SCHOOL_STUDENT_STATUS_CONFIG[status].color,
        onClick: async () => {
            if (validateActivity(currentStatus, status)) {
                await updateSchoolStudentActive(student.schema.id, status === "active");
                onStatusChange?.();
            }
        },
    }));

    return (
        <Row
            id={student.schema.id}
            entityData={student}
            entityBgColor={studentEntity.bgColor}
            entityColor={studentEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <StudentIcon className="w-10 h-10" />
                    </div>
                ),
                name: (
                    <HoverToEntity entity={studentEntity} id={student.schema.id}>
                        {fullName}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<StudentAction student={student} />}
            popover={<StudentPackagePopover student={student} />}
            stats={stats}
        />
    );
};
