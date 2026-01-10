import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { BADGE_STATUS_GREEN, BADGE_BG_OPACITY_MEDIUM } from "@/types/status";

interface TeacherCommissionBadgeProps {
    value: string;
    type: string;
    currency?: string;
}

export function TeacherCommissionBadge({ value, type, currency = "€" }: TeacherCommissionBadgeProps) {
    const displayValue = type === "fixed" ? `${value} ${currency}` : `${value}%`;

    return (
        <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground"
            style={{ backgroundColor: `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_MEDIUM}` }}
        >
            <HandshakeIcon size={14} />
            <span>{displayValue}</span>
        </div>
    );
}
