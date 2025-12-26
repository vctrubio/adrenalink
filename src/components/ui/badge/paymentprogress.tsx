import { TrendingDown } from "lucide-react";

interface PaymentProgressBadgeProps {
  paid: number;
  earned: number;
  currency: string;
  background: string;
}

export function PaymentProgressBadge({ paid, earned, currency, background }: PaymentProgressBadgeProps) {
  const hasMissingPayment = paid < earned;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background }} />
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
        {paid}/{earned} {currency}
        {hasMissingPayment && <TrendingDown size={12} className="text-destructive" />}
      </span>
    </div>
  );
}
