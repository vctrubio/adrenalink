"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { BookingTag, BookingCreateTag, BankCalculatorTag } from "@/src/components/ui/tag";
import { ENTITY_DATA } from "@/config/entities";
import { getStudentBookingsCount, getStudentEventsCount, getStudentTotalHours, getStudentRequestedPackagesCount, getStudentMoneyIn, getStudentMoneyOut } from "@/getters/students-getter";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import type { StudentModel } from "@/backend/models";

const StudentAction = ({ student }: { student: StudentModel }) => {
    const bookingStudents = student.relations?.bookingStudents || [];
    const moneyIn = getStudentMoneyIn(student);
    const moneyOut = getStudentMoneyOut(student);
    const netMoney = moneyIn - moneyOut;
    const bankColor = netMoney >= 0 ? "#10b981" : "#ef4444";

    const bookingEntity = ENTITY_DATA.find(e => e.id === "booking")!;

    return (
        <div className="flex flex-wrap gap-2">
            {bookingStudents.length === 0 ? (
                <BookingCreateTag
                    icon={<BookingIcon className="w-3 h-3" />}
                    onClick={() => console.log("Creating new booking...")}
                />
            ) : (
                <>
                    {bookingStudents.map((bookingStudent) => {
                        const booking = bookingStudent.booking;
                        if (!booking) return null;

                        return (
                            <BookingTag
                                key={booking.id}
                                icon={<BookingIcon className="w-3 h-3" />}
                                dateStart={booking.dateStart}
                                dateEnd={booking.dateEnd}
                                status="active"
                                link={`/bookings/${booking.id}`}
                            />
                        );
                    })}
                    <BankCalculatorTag
                        icon={<BankIcon className="w-3 h-3" />}
                        moneyIn={moneyIn}
                        moneyOut={moneyOut}
                        bgColor={bookingEntity.bgColor}
                        color={bankColor}
                    />
                </>
            )}
        </div>
    );
};

interface StudentRowProps {
    student: StudentModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const StudentRow = ({ student, isExpanded, onToggle }: StudentRowProps) => {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const requestEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
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

    const moneyIn = getStudentMoneyIn(student);
    const moneyOut = getStudentMoneyOut(student);
    const netMoney = moneyIn - moneyOut;
    const bankColor = netMoney >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <RequestIcon className="w-5 h-5" />, value: getStudentRequestedPackagesCount(student), color: requestEntity.color },
        { icon: <BookingIcon className="w-5 h-5" />, value: getStudentBookingsCount(student), color: bookingEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: getStudentEventsCount(student), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getStudentTotalHours(student), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: netMoney, color: bankColor },
    ];

    return (
        <Row
            id={student.schema.id}
            entityName={studentEntity.name}
            entityBgColor={studentEntity.bgColor}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <StudentIcon className="w-10 h-10" />
                    </div>
                ),
                name: fullName,
                status: "Active Student",
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<StudentAction student={student} />}
            stats={stats}
        />
    );
};
