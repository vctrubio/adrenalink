import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface TeacherCommissionBadgeProps {
  value: string;
  type: string;
}

export function TeacherCommissionBadge({ value, type }: TeacherCommissionBadgeProps) {
  const displayValue = type === "fixed" ? `${value}€` : `${value}%`;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700">
      <HandshakeIcon size={14} />
      <span>{displayValue}</span>
    </div>
  );
}
