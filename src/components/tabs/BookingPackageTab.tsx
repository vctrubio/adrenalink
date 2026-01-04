"use client";

import PackageIcon from "@/public/appSvgs/PackageIcon";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel";

interface BookingPackageTabProps {
    data: ClassboardData;
    pricePerStudent: number;
    pricePerHour: number;
}

export const BookingPackageTab = ({ data, pricePerStudent, pricePerHour }: BookingPackageTabProps) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageColor = packageEntity?.color || "#fb923c";

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${packageColor}20`, color: packageColor }}>
                    <PackageIcon size={24} />
                </div>
                <div className="flex flex-col">
                    <div className="text-sm font-semibold text-foreground">Package</div>
                    <div className="text-xs text-muted-foreground">{data.schoolPackage.description}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span className="text-muted-foreground">Duration:</span><p className="font-medium">{getPrettyDuration(data.schoolPackage.durationMinutes)}</p></div>
                <div><span className="text-muted-foreground">Price/Student:</span><p className="font-medium">${pricePerStudent.toFixed(2)}</p></div>
                <div><span className="text-muted-foreground">Price/Hour:</span><p className="font-medium">${pricePerHour.toFixed(2)}/hr</p></div>
                <div><span className="text-muted-foreground">Equipment:</span><p className="font-medium capitalize">{data.schoolPackage.categoryEquipment}</p></div>
            </div>
        </div>
    );
};
