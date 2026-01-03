"use client";

import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";

interface PackageComparisonBadgeProps {
    categoryEquipment?: string | null;
    equipmentCapacity: number;
    studentCapacity: number;
    packageDurationHours: number;
    pricePerHour: number;
    currencySymbol: string;
}

export function PackageComparisonBadge({ 
    categoryEquipment, 
    equipmentCapacity, 
    studentCapacity, 
    packageDurationHours, 
    pricePerHour,
    currencySymbol
}: PackageComparisonBadgeProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);

    const studentColor = studentEntity.color;
    
    const equipmentColor = equipmentConfig?.color || "#a855f7";
    const equipmentBg = equipmentConfig?.bgColor || "#f3e8ff";
    const CategoryIcon = equipmentConfig?.icon;
    
    // Derived colors for consistency
    const studentBg = "#dbeafe"; // blue-100-ish
    const priceColor = "#f97316"; // orange-500
    const priceBg = "#ffedd5"; // orange-100

    return (
        <div className="flex flex-wrap items-center gap-6">
            {/* Equipment */}
            {equipmentCapacity > 0 && CategoryIcon && (
                <div className="relative group" title="Equipment">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5 shadow-sm transition-transform hover:scale-105"
                        style={{ backgroundColor: equipmentBg }}
                    >
                        <div style={{ color: equipmentColor }}>
                            <CategoryIcon size={24} className="fill-current" />
                        </div>
                    </div>
                    {equipmentCapacity > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black text-white shadow-sm border border-white">
                            x{equipmentCapacity}
                        </span>
                    )}
                </div>
            )}

            {/* Student */}
            <div className="relative group" title="Students">
                <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: studentBg }}
                >
                    <div style={{ color: studentColor }}>
                        <HelmetIcon size={24} className="fill-current" />
                    </div>
                </div>
                {studentCapacity > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black text-white shadow-sm border border-white">
                        x{studentCapacity}
                    </span>
                )}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3 group" title="Duration">
                <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5 shadow-sm bg-zinc-50 transition-transform hover:scale-105"
                >
                    <div className="text-zinc-400">
                        <PackageIcon size={24} />
                    </div>
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-sm font-black text-zinc-700">{packageDurationHours}</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Hours</span>
                </div>
            </div>

            {/* PPH */}
            {pricePerHour > 0 && (
                <div className="flex items-center gap-3 group" title="Price Per Hour">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5 shadow-sm transition-transform hover:scale-105"
                        style={{ backgroundColor: priceBg }}
                    >
                        <div style={{ color: priceColor }}>
                            <CreditIcon size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-black text-zinc-700">{pricePerHour.toFixed(0)}</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{currencySymbol}/HR</span>
                    </div>
                </div>
            )}
        </div>
    );
}