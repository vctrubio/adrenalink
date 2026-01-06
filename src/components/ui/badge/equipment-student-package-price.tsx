import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import PPHIcon from "@/public/appSvgs/PPHIcon";

interface EquipmentStudentPackagePriceBadgeProps {
    categoryEquipment?: string | null;
    equipmentCapacity: number;
    studentCapacity: number;
    packageDurationHours: number;
    pricePerHour: number;
}

export function EquipmentStudentPackagePriceBadge({ 
    categoryEquipment, 
    equipmentCapacity, 
    studentCapacity, 
    packageDurationHours, 
    pricePerHour 
}: EquipmentStudentPackagePriceBadgeProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);

    const studentColor = studentEntity.color;
    const StudentIcon = studentEntity.icon;
    
    const packageColor = packageEntity.color;
    const PackageIcon = packageEntity.icon;
    
    const equipmentColor = equipmentConfig?.color || "#a855f7";
    const CategoryIcon = equipmentConfig?.icon;
    
    const priceColor = "#f97316";

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

        

                    {/* Package Duration */}

                    <div className="flex items-center gap-1.5">

                        <div style={{ color: packageColor }}>

                            <PackageIcon size={16} />

                        </div>

                        <div className="flex items-baseline gap-0.5">

                            <span className="text-sm text-foreground">{packageDurationHours.toFixed(0)}</span>

                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">h</span>

                        </div>

                    </div>

        

                    {/* Price */}

                    <div className="flex items-center gap-1.5">

                        <div style={{ color: priceColor }}>

                            <PPHIcon size={16} />

                        </div>

                        <div className="flex items-baseline gap-0.5">

                            <span className="text-sm text-foreground">{(pricePerHour && isFinite(pricePerHour)) ? pricePerHour.toFixed(0) : "0"}</span>

                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">/h</span>

                        </div>

                    </div>

                </div>

            );

        }

        

    