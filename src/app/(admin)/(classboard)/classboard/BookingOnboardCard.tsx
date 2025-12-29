"use client";

import { Receipt } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { getCompactNumber } from "@/getters/integer-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import type { ClassboardData } from "@/backend/models/ClassboardModel";

// Muted amber - softer than student entity color
const STUDENT_COLOR = "#ca8a04";

interface BookingOnboardCardProps {
    bookingData: ClassboardData;
    selectedDate: string;
    onClick?: () => void;
}

export default function BookingOnboardCard({
    bookingData,
    selectedDate,
    onClick
}: BookingOnboardCardProps) {
    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const studentCount = bookingStudents.length;

    // Get today's events
    const todayEvents = lessons.flatMap(lesson =>
        (lesson.events || []).filter(event => {
            if (!event.date) return false;
            const eventDate = new Date(event.date).toISOString().split("T")[0];
            return eventDate === selectedDate;
        })
    );

    // Get first event for status
    const firstEvent = todayEvents[0];
    const status = firstEvent?.status || "planned";
    const statusConfig = EVENT_STATUS_CONFIG[status];

    // Calculate total revenue from all events today
    const totalRevenue = todayEvents.reduce((sum, event) => {
        const duration = event.duration || 0;
        const durationHours = duration / 60;
        const pricePerStudent = schoolPackage.pricePerStudent || 0;
        return sum + (pricePerStudent * studentCount * durationHours);
    }, 0);

    // Get equipment config
    const categoryEquipment = schoolPackage.categoryEquipment;
    const capacityEquipment = schoolPackage.capacityEquipment || 1;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    // Get package info for progress bar
    const packageInfo = getPackageInfo(schoolPackage, lessons);

    return (
        <div
            onClick={onClick}
            className="group relative w-full overflow-hidden rounded-xl border border-border transition-colors duration-200 cursor-pointer hover:bg-muted/30"
        >
            <ClassboardProgressBar lessons={lessons} durationMinutes={packageInfo.durationMinutes} />

            <div className="h-16 flex items-center gap-4 px-6 bg-background">
                {/* Student Icon */}
            <div className="flex-shrink-0" style={{ color: STUDENT_COLOR }}>
                <HelmetIcon size={28} />
            </div>

            {/* Student Name (First Name Only) */}
            <span className="text-xl font-bold text-foreground truncate min-w-0 flex-shrink-0">
                {booking.leaderStudentName.split(" ")[0]}
            </span>

            {/* Student Count */}
            {studentCount > 1 && (
                <div className="flex items-center gap-0.5 text-base text-muted-foreground shrink-0">
                    <HelmetIcon size={18} />
                    <span className="font-semibold">{studentCount}</span>
                </div>
            )}

            {/* Equipment */}
            {EquipmentIcon && (
                <div className="flex items-center gap-0.5 shrink-0" style={{ color: equipmentConfig?.color }}>
                    <EquipmentIcon size={18} />
                    {capacityEquipment > 1 && <span className="text-sm font-semibold">{capacityEquipment}</span>}
                </div>
            )}

            {/* Status Badge */}
            <div
                className="px-2 py-1 rounded-md text-xs font-semibold shrink-0"
                style={{
                    backgroundColor: `${statusConfig.color}20`,
                    color: statusConfig.color
                }}
            >
                {statusConfig.label}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Revenue */}
            {totalRevenue > 0 && (
                <div className="flex items-center gap-1 text-base text-blue-600 dark:text-blue-400 shrink-0">
                    <Receipt size={18} />
                    {getCompactNumber(totalRevenue)}
                </div>
            )}
            </div>
        </div>
    );
}
