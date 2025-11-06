"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { ENTITY_DATA } from "@/config/entities";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import type { StudentModel } from "@/backend/models";

const StudentAction = () => {
    return <div className="text-sm text-muted-foreground">Hello World</div>;
};

interface StudentRowProps {
    student: StudentModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const StudentRow = ({ student, isExpanded, onToggle }: StudentRowProps) => {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const StudentIcon = studentEntity.icon;
    const entityColor = studentEntity.color;
    const iconColor = isExpanded ? entityColor : "text-gray-400";

    const fullName = `${student.schema.firstName} ${student.schema.lastName}`;

    const strItems = [
        { label: "Passport", value: student.schema.passport },
        { label: "Country", value: student.schema.country },
        { label: "Phone", value: student.schema.phone },
        { label: "Joined", value: new Date(student.schema.createdAt).toLocaleDateString() },
    ];

    const stats: StatItem[] = [
        { icon: <BookingIcon className="w-5 h-5" />, value: 12 },
        { icon: <FlagIcon className="w-5 h-5" />, value: 8 },
        { icon: <DurationIcon className="w-5 h-5" />, value: 24 },
    ];

    return (
        <Row
            id={student.schema.id}
            entityName={studentEntity.name}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: <StudentIcon className={`w-10 h-10 ${iconColor}`} />,
                name: fullName,
                status: "Active Student",
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<StudentAction />}
            stats={stats}
            entityColor={entityColor}
        />
    );
};
