"use client";

import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { TLETab } from "./TLETab";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface ActiveBookingTabProps {
    booking: ActiveBookingModel;
}

// Sleek Adrenalink-branded progress slider
const BookingProgressBar = ({ completedMinutes, booking }: { completedMinutes: number; booking: ActiveBookingModel }) => {
    const progressPercent = Math.min((completedMinutes / booking.package.durationMinutes) * 100, 100);
    const packageEntityConfig = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageColor = packageEntityConfig?.color;
    const totalRevenue = booking.package.pricePerStudent * booking.students.length;

    return (
        <div className="space-y-2">
            {/* Slim progress slider with Adrenalink orange gradient */}
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden relative">
                <div
                    className="h-full transition-all duration-500 bg-gradient-to-r from-[#fb923c] to-[#f59e0b]"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Stats row - subtle and clean */}
            <div className="flex items-center justify-between text-xs">
                <div className="text-muted-foreground font-medium">
                    {getPrettyDuration(completedMinutes)} / {getPrettyDuration(booking.package.durationMinutes)}
                </div>
                <div className="flex items-center gap-1">
                    <div style={{ color: packageColor }}>
                        <PackageIcon size={14} />
                    </div>
                    <div className="font-semibold text-foreground">${Math.round(totalRevenue * 100) / 100}</div>
                </div>
            </div>
        </div>
    );
};

export const ActiveBookingTab = ({ booking }: ActiveBookingTabProps) => {
    // Get equipment icon and color based on category
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === booking.package.categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;
    const equipmentColor = equipmentConfig?.color;

    // Get entity colors for styling
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const studentColor = studentEntity.color;

    // Format dates
    const dateStart = new Date(booking.dateStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
    });

    const dateEnd = new Date(booking.dateEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
    });

    // Generate helmet icons for student capacity
    const studentCapacity = booking.package.capacityStudents;
    const studentCount = booking.students.length;
    const helmets = Array.from({ length: studentCapacity }, (_, i) => i < studentCount);

    const completedMinutes = booking.totalEventDuration;

    return (
        <div className="w-[365px] flex-shrink-0 space-y-3">
            {/* Main Booking Card */}
            <div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                {/* Header: Equipment Icon + Dates */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 p-2 border border-border rounded-lg" style={{ color: equipmentColor }}>
                        {EquipmentIcon && <EquipmentIcon width={32} height={32} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-foreground mb-2">
                            {dateStart} - {dateEnd}
                        </div>
                        {/* Bigger Helmet Icons - size 8 */}
                        <div className="flex gap-1.5">
                            {helmets.map((isFilled, index) => (
                                <div
                                    key={index}
                                    style={{ color: isFilled ? studentColor : "#d1d5db" }}
                                    className="opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <HelmetIcon className="w-8 h-8" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Student Names */}
                <div className="text-sm flex flex-wrap gap-1.5 mb-3">
                    {booking.students.map((student) => (
                        <HoverToEntity key={student.id} entity={studentEntity} id={student.id} className="font-semibold">
                            {student.firstName} {student.lastName}
                        </HoverToEntity>
                    ))}
                </div>

                {/* Sleek Progress Slider */}
                <BookingProgressBar completedMinutes={completedMinutes} booking={booking} />
            </div>

            {/* Teachers & Events - TLETab */}
            {booking.events.length > 0 && <TLETab booking={booking} />}
        </div>
    );
};
