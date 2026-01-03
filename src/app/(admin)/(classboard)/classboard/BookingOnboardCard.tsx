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

            <div className="h-14 flex items-center gap-2 px-6 bg-background">
                {/* Student Icon + Name */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0" style={{ color: STUDENT_COLOR }}>
                        <HelmetIcon size={24} />
                    </div>
                    <span className="text-lg font-bold text-foreground truncate">
                        {booking.leaderStudentName.split(" ")[0]}
                    </span>
                </div>

                {/* Student Count Badge */}
                {studentCount > 1 && (
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                        <HelmetIcon size={14} />
                        <span className="font-semibold">{studentCount}</span>
                    </div>
                )}

                {/* Equipment Badge */}
                {EquipmentIcon && (
                    <div className="flex items-center gap-0.5 shrink-0" style={{ color: equipmentConfig?.color }}>
                        <EquipmentIcon size={16} />
                        {capacityEquipment > 1 && <span className="text-xs font-semibold">{capacityEquipment}</span>}
                    </div>
                )}

                {/* Status Badge */}
                <div
                    className="px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 text-foreground"
                    style={{ backgroundColor: statusConfig.color }}
                >
                    {statusConfig.label}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Revenue */}
                {totalRevenue > 0 && (
                    <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 shrink-0">
                        <Receipt size={16} />
                        {getCompactNumber(totalRevenue)}
                    </div>
                )}
            </div>
        </div>
    );
}
