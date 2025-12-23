import HelmetIcon from "@/public/appSvgs/HelmetIcon";

interface EquipmentStudentCapacityBadgeProps {
  categoryIcon: React.ComponentType<{ size?: number }>;
  equipmentCapacity: number;
  studentCapacity: number;
}

export function EquipmentStudentCapacityBadge({
  categoryIcon: CategoryIcon,
  equipmentCapacity,
  studentCapacity,
}: EquipmentStudentCapacityBadgeProps) {
  const studentColor = "#eab308"; // Color for student entity from config/entities.ts
  const equipmentColor = "#a855f7"; // Color for equipment entity from config/entities.ts

  return (
    <div className="flex items-center justify-start">
      <div className="flex items-center gap-1">
        {equipmentCapacity > 0 && (
          <>
            <div style={{ color: equipmentColor }}>
              <CategoryIcon size={16} />
            </div>
            {equipmentCapacity > 1 && (
              <p className="text-sm font-medium text-foreground">{equipmentCapacity}</p>
            )}
            <span className="text-sm text-muted-foreground mx-1">/</span>
          </>
        )}
        <div style={{ color: studentColor }}>
          <HelmetIcon size={16} />
        </div>
        {studentCapacity > 1 && (
          <p className="text-sm font-medium text-foreground">{studentCapacity}</p>
        )}
      </div>
    </div>
  );
}
