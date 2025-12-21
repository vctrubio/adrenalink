"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { BookingTag, BookingCreateTag } from "@/src/components/tags";
import { StudentPackagePopover } from "@/src/components/popover/StudentPackagePopover";
import { StudentRowStats as DataboardStudentStats } from "@/src/components/databoard/stats";
import { SCHOOL_STUDENT_STATUS_CONFIG, type SchoolStudentStatus } from "@/types/status";
import { updateSchoolStudentActive } from "@/actions/students-action";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import { StudentDropdownRow } from "./StudentDropdownRow";
import type { StudentModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export const calculateStudentGroupStats = DataboardStudentStats.getStats;

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

    const stats = DataboardStudentStats.getStats(student, false);

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
            expandedContent={<StudentDropdownRow item={student} />}
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
