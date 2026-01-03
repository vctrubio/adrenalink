"use client";

import { Receipt } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getCompactNumber } from "@/getters/integer-getter";
import { getEventStatusCounts } from "@/getters/booking-progress-getter";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import type { ClassboardData } from "@/backend/models/ClassboardModel";

// Muted amber - softer than student entity color
const STUDENT_COLOR = "#ca8a04";

interface BookingOnboardCardProps {
    bookingData: ClassboardData;
    onClick?: () => void;
}

export default function BookingOnboardCard({
    bookingData,
    onClick
}: BookingOnboardCardProps) {
    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const studentCount = bookingStudents.length;

    // Get all events (already filtered by selectedDate in provider)
    const allEvents = lessons.flatMap(lesson => lesson.events || []);

    // Calculate total revenue from all events
    const totalRevenue = allEvents.reduce((sum, event) => {
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

    // Calculate event status counts and total minutes for progress bar
    const eventCounts = getEventStatusCounts(allEvents);
    const todayEventMinutes = allEvents.reduce((sum, event) => sum + (event.duration || 0), 0);

    return (
        <div
            onClick={onClick}
            className="group relative w-full overflow-hidden rounded-xl border border-border transition-colors duration-200 cursor-pointer hover:bg-muted/30"
        >
            <ClassboardProgressBar counts={eventCounts} durationMinutes={todayEventMinutes} />

            <div className="h-12 flex items-center justify-between px-6 bg-background gap-4">
                {/* Left: Student Icon + Name */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0" style={{ color: STUDENT_COLOR }}>
                        <HelmetIcon size={24} />
                    </div>
                    <span className="text-lg font-bold text-foreground truncate">
                        {booking.leaderStudentName.split(" ")[0]}
                    </span>
                </div>

                {/* Right: Student Count + Equipment + Receipt */}
                <div className="flex items-center gap-3 shrink-0">
                    {studentCount > 1 && (
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <HelmetIcon size={14} />
                            <span className="font-semibold">{studentCount}</span>
                        </div>
                    )}

                    {EquipmentIcon && (
                        <div className="flex items-center gap-0.5" style={{ color: equipmentConfig?.color }}>
                            <EquipmentIcon size={18} />
                            {capacityEquipment > 1 && <span className="text-xs font-semibold">{capacityEquipment}</span>}
                        </div>
                    )}

                    {totalRevenue > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                            <Receipt size={14} />
                            <span className="font-bold">{getCompactNumber(totalRevenue)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
