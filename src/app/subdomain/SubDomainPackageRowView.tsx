"use client";

import { useState, useRef } from "react";
import type { SchoolPackageType } from "@/drizzle/schema";
import { getPrettyDuration } from "@/getters/duration-getter";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

interface SubDomainPackageRowViewProps {
    package: SchoolPackageType;
    onClick?: () => void;
}

const ENTITY_COLOR = "#fb923c"; // Package entity color
const DEFAULT_ICON_COLOR = "#9ca3af";

export const SubDomainPackageRowView = ({ package: pkg, onClick }: SubDomainPackageRowViewProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const rowRef = useRef<HTMLDivElement>(null);

    const iconColor = isHovered ? ENTITY_COLOR : DEFAULT_ICON_COLOR;
    const durationHours = pkg.durationMinutes / 60;
    const pricePerHour = durationHours > 0 ? pkg.pricePerStudent / durationHours : 0;

    const stats = [
        {
            icon: EquipmentIcon,
            color: "#a855f7",
            label: `Equipment / ${pkg.categoryEquipment}`,
            value: pkg.capacityEquipment,
        },
        {
            icon: HelmetIcon,
            color: "#eab308",
            label: "Students",
            value: pkg.capacityStudents,
        },
        {
            icon: CreditIcon,
            color: "#10b981",
            label: "Price",
            value: `$${pkg.pricePerStudent}`,
        },
        {
            icon: DurationIcon,
            color: "#06b6d4",
            label: "Duration",
            value: getPrettyDuration(pkg.durationMinutes),
        },
    ];

    return (
        <div
            ref={rowRef}
            className="group bg-card overflow-hidden border border-border rounded-lg transition-all duration-300 hover:shadow-lg hover:border-[#fb923c]/30 cursor-pointer relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Package Icon - Top Right Absolute */}
            <div className="absolute top-4 right-4 z-10">
                <div
                    className="transition-all duration-300 transform group-hover:scale-110"
                    style={{ color: iconColor }}
                >
                    <PackageIcon className="w-12 h-12" />
                </div>
            </div>

            <div className="px-6 py-5 hover:bg-accent/10 transition-colors">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto pr-16">
                    {/* Description */}
                    <div className="mb-6 w-full">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[#fb923c] transition-colors">
                            {pkg.description}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-full bg-muted font-medium uppercase tracking-wide">
                                {pkg.packageType}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-muted font-medium uppercase tracking-wide">
                                {pkg.categoryEquipment}
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-4 w-full">
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={index} className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0" style={{ color: stat.color }}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                                    </div>
                                    <div className="text-lg font-semibold text-foreground">
                                        {stat.value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Price Per Hour - Secondary Info */}
                    <div className="pt-3 border-t border-border/50 w-full">
                        <div className="text-sm text-muted-foreground">
                            Price per hour: <span className="font-semibold text-foreground">${pricePerHour.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
