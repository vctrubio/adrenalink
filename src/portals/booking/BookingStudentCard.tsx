"use client";

import { CardList } from "@/src/components/ui/card/card-list";
import { minutesToHours } from "@/getters/duration-getter";
import { BookingUserCard } from "./BookingUserCard";
import { Users, Calendar } from "lucide-react";

interface BookingStudentCardProps {
    packageName: string;
    packageDescription?: string;
    durationMinutes: number;
    pricePerStudent: number;
    studentsCount: number;
    dateStart: string;
    dateEnd: string;
    status: string;
}

export function BookingStudentCard({
    packageName,
    packageDescription = "No description available",
    durationMinutes,
    pricePerStudent,
    studentsCount,
    dateStart,
    dateEnd,
    status,
}: BookingStudentCardProps) {
    const durationHours = minutesToHours(durationMinutes);

    const fields = [
        { label: "Package", value: packageName },
        { label: "Description", value: packageDescription },
        { label: "Duration", value: `${durationMinutes} minutes (${durationHours}h)` },
        { label: "Price", value: `$${pricePerStudent}` },
        { label: "Students", value: `${studentsCount}` },
    ];

    const statusColor = status === "active" ? "#22c55e" : status === "completed" ? "#3b82f6" : "#ef4444";

    const footerLeftContent = (
        <div className="flex items-center gap-5 text-zinc-400">
            <div className="flex items-center gap-2">
                <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                        backgroundColor: `${statusColor}20`,
                        color: statusColor,
                    }}
                >
                    {status}
                </div>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
                <Users size={18} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight text-zinc-300">
                    {studentsCount} {studentsCount === 1 ? "Student" : "Students"}
                </span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
                <Calendar size={18} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight text-zinc-300">
                    {durationMinutes} min
                </span>
            </div>
        </div>
    );

    return (
        <BookingUserCard
            dateStart={dateStart}
            dateEnd={dateEnd}
            status={status}
            footerLeftContent={footerLeftContent}
        >
            <CardList fields={fields} />
        </BookingUserCard>
    );
}
