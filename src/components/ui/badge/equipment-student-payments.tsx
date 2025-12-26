"use client";

import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

interface EquipmentStudentPaymentsBadgeProps {
    categoryEquipment?: string | null;
    equipmentCapacity: number;
    studentCapacity: number;
    packageDurationHours: number;
    pricePerHour: number;
    currency?: string;
}

export function EquipmentStudentPaymentsBadge({ 
    categoryEquipment, 
    equipmentCapacity, 
    studentCapacity, 
    packageDurationHours, 
    pricePerHour,
    currency = "YEN"
}: EquipmentStudentPaymentsBadgeProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);

    const studentColor = studentEntity.color;
    const StudentIcon = studentEntity.icon;
    
    const packageColor = packageEntity.color;
    const PackageIcon = packageEntity.icon;
    
    const equipmentColor = equipmentConfig?.color || "#a855f7";
    const CategoryIcon = equipmentConfig?.icon;
    
    // Calculate total price per hour for the group
    const totalPricePerHour = pricePerHour * (studentCapacity > 0 ? studentCapacity : 1);

    return (
        <div className="flex items-center justify-start gap-4 text-sm">
            {/* Equipment & Student Group */}
            <div className="flex items-center gap-3">
                {/* Equipment */}
                {equipmentCapacity > 0 && CategoryIcon && (
                    <div className="flex items-center gap-1.5">
                        <div style={{ color: equipmentColor }}>
                            <CategoryIcon size={16} />
                        </div>
                        {equipmentCapacity > 1 && <span className="font-bold text-foreground">{equipmentCapacity}</span>}
                    </div>
                )}

                {/* Student */}
                <div className="flex items-center gap-1.5">
                    <div style={{ color: studentColor }}>
                        <StudentIcon size={16} />
                    </div>
                    {studentCapacity > 1 && <span className="font-bold text-foreground">{studentCapacity}</span>}
                </div>
            </div>

            {/* Package & Payment Combined */}
            <div className="flex items-center gap-2">
                <div style={{ color: packageColor }}>
                    <PackageIcon size={16} />
                </div>
                <div className="flex items-baseline gap-1 font-bold">
                    <span>{totalPricePerHour.toFixed(0)}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{currency}</span>
                    <span className="text-muted-foreground/60 font-normal mx-0.5">×</span>
                    <span>{packageDurationHours}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">H</span>
                </div>
            </div>
        </div>
    );
}