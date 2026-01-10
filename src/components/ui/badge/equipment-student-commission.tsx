import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface EquipmentStudentCommissionBadgeProps {
    categoryEquipment?: string | null;
    equipmentCapacity: number;
    studentCapacity: number;
    commissionType: "fixed" | "percentage";
    commissionValue: number;
}

export function EquipmentStudentCommissionBadge({
    categoryEquipment,
    equipmentCapacity,
    studentCapacity,
    commissionType,
    commissionValue,
}: EquipmentStudentCommissionBadgeProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);

    const studentColor = studentEntity.color;
    const StudentIcon = studentEntity.icon;

    const equipmentColor = equipmentConfig?.color || "#a855f7";
    const CategoryIcon = equipmentConfig?.icon;

    const commissionColor = "#22c55e";

    const displayCommission = commissionType === "percentage" ? `${commissionValue}%` : `${commissionValue}`;

    return (
        <div className="flex items-center justify-start gap-4">
            {/* Equipment */}
            {equipmentCapacity > 0 && CategoryIcon && (
                <div className="flex items-center gap-1.5">
                    <div style={{ color: equipmentColor }}>
                        <CategoryIcon size={16} />
                    </div>
                    {equipmentCapacity > 1 && <span className="text-sm text-foreground">{equipmentCapacity}</span>}
                </div>
            )}

            {/* Student */}
            <div className="flex items-center gap-1.5">
                <div style={{ color: studentColor }}>
                    <StudentIcon size={16} />
                </div>
                {studentCapacity > 1 && <span className="text-sm text-foreground">{studentCapacity}</span>}
            </div>

            {/* Commission */}
            {/* comission is now how much from earning from lesson, not per hour */}
            <div className="flex items-center gap-1.5">
                <div style={{ color: commissionColor }}>
                    <HandshakeIcon size={16} />
                </div>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-sm text-foreground">{displayCommission}</span>
                </div>
            </div>
        </div>
    );
}
