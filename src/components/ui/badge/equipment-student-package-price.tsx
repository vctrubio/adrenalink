import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import PPHIcon from "@/public/appSvgs/PPHIcon";

interface EquipmentStudentPackagePriceBadgeProps {
  categoryIcon?: React.ComponentType<{ size?: number }>;
  equipmentCapacity: number;
  studentCapacity: number;
  packageDurationHours: number;
  packageIcon: React.ComponentType<{ size?: number }>;
  packageColor: string;
  pricePerHour: number;
}

export function EquipmentStudentPackagePriceBadge({
  categoryIcon: CategoryIcon,
  equipmentCapacity,
  studentCapacity,
  packageDurationHours,
  packageIcon: PackageIcon,
  packageColor,
  pricePerHour,
}: EquipmentStudentPackagePriceBadgeProps) {
  const studentColor = "#eab308"; 
  const equipmentColor = "#a855f7"; 
  const priceColor = "#f97316"; 

  return (
    <div className="flex items-center justify-start gap-4">
      {/* Equipment */}
      {equipmentCapacity > 0 && CategoryIcon && (
        <div className="flex items-center gap-1.5">
          <div style={{ color: equipmentColor }}>
            <CategoryIcon size={16} />
          </div>
          {equipmentCapacity > 1 && (
            <span className="text-sm text-foreground">
              {equipmentCapacity}
            </span>
          )}
        </div>
      )}

      {/* Student */}
      <div className="flex items-center gap-1.5">
        <div style={{ color: studentColor }}>
          <HelmetIcon size={16} />
        </div>
        {studentCapacity > 1 && (
          <span className="text-sm text-foreground">
            {studentCapacity}
          </span>
        )}
      </div>

      {/* Package Duration */}
      <div className="flex items-center gap-1.5">
        <div style={{ color: packageColor }}>
          <PackageIcon size={16} />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm text-foreground">
            {packageDurationHours}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">h</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1.5">
        <div style={{ color: priceColor }}>
          <PPHIcon size={16} />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm text-foreground">
            {pricePerHour.toFixed(0)}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">/h</span>
        </div>
      </div>
    </div>
  );
}
