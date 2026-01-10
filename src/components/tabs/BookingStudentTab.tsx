"use client";

import Link from "next/link";
import { ENTITY_DATA } from "@/config/entities";
import type { ClassboardBookingStudent } from "@/backend/classboard/ClassboardModel";

interface BookingStudentTabProps {
    student: ClassboardBookingStudent["student"];
}

const StudentInfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between py-2 px-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    );
};

export const BookingStudentTab = ({ student }: BookingStudentTabProps) => {
    const studentColor = ENTITY_DATA.find((e) => e.id === "student")?.color;

    if (!student) {
        return null;
    }

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const StudentIcon = studentEntity?.icon;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
                <Link href={`/students/${student.id}`}>
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${studentColor}20`, color: studentColor }}
                    >
                        {StudentIcon && <StudentIcon size={24} />}
                    </div>
                </Link>
                <div className="flex flex-col">
                    <div className="text-sm font-semibold text-foreground">
                        {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{student.passport}</div>
                </div>
            </div>

            <div className="divide-y divide-border">
                <div className="py-2">
                    <StudentInfoRow label="Country" value={student.country} />
                </div>
                <div className="py-2">
                    <StudentInfoRow label="Phone" value={student.phone} />
                </div>
                <div className="py-2">
                    <StudentInfoRow label="Languages" value={student.languages} />
                </div>
                {student.description && (
                    <div className="py-2 space-y-1">
                        <div className="text-sm text-muted-foreground">Description</div>
                        <div className="text-sm text-foreground">{student.description}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
