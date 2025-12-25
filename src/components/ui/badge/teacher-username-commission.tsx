import type { EntityConfig } from "@/config/entities";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { BADGE_STATUS_GREEN, BADGE_BG_OPACITY_MEDIUM } from "@/types/status";

interface TeacherUsernameCommissionBadgeProps {
  teacherIcon: React.ComponentType<{ className?: string; size?: number }>;
  teacherUsername: string;
  teacherColor: string;
  commissionValue: string;
  commissionType: "fixed" | "percentage";
  currency?: string;
}

export function TeacherUsernameCommissionBadge({
  teacherIcon: TeacherIcon,
  teacherUsername,
  teacherColor,
  commissionValue,
  commissionType,
  currency = "€",
}: TeacherUsernameCommissionBadgeProps) {
  const displayValue = commissionType === "fixed" ? `${commissionValue} ${currency}` : `${commissionValue}%`;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground"
      style={{ backgroundColor: `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_MEDIUM}` }}
    >
      <div style={{ color: teacherColor }}>
        <TeacherIcon size={14} />
      </div>
      <span>{teacherUsername}</span>
      <HandshakeIcon size={14} />
      <span>{displayValue}</span>
    </div>
  );
}
