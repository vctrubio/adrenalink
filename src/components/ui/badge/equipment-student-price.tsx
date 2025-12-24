import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import PPHIcon from "@/public/appSvgs/PPHIcon";

interface EquipmentStudentPriceBadgeProps {
  categoryIcon: React.ComponentType<{ size?: number }>;
  equipmentCapacity: number;
  studentCapacity: number;
  pricePerHour: number;
}

export function EquipmentStudentPriceBadge({
  categoryIcon: CategoryIcon,
  equipmentCapacity,
  studentCapacity,
  pricePerHour,
}: EquipmentStudentPriceBadgeProps) {
  const studentColor = "#eab308"; // Student entity color
  const equipmentColor = "#a855f7"; // Equipment entity color
  const priceColor = "#f97316"; // Orange color for price as requested

  return (
    <div className="flex items-center justify-start gap-5">
      {/* Equipment Segment */}
      {equipmentCapacity > 0 && (
        <div className="flex items-center gap-1.5">
          <div style={{ color: equipmentColor }}>
            <CategoryIcon size={16} />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {equipmentCapacity}
          </span>
        </div>
      )}

      {/* Student Segment */}
      <div className="flex items-center gap-1.5">
        <div style={{ color: studentColor }}>
          <HelmetIcon size={16} />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {studentCapacity}
        </span>
      </div>

      {/* Price Segment */}
      <div className="flex items-center gap-1.5">
        <div style={{ color: priceColor }}>
          <PPHIcon size={16} />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm font-bold text-foreground">
            {pricePerHour.toFixed(0)}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">/h</span>
        </div>
      </div>
    </div>
  );
}
