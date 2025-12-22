interface ReferralCommissionBadgeProps {
  value: string;
  type: string;
}

export function ReferralCommissionBadge({ value, type }: ReferralCommissionBadgeProps) {
  const displayValue = type === "fixed" ? `${value}€` : `${value}%`;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-700">
      <span>{displayValue}</span>
    </div>
  );
}
