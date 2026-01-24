import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { BADGE_STATUS_GREEN, BADGE_BG_OPACITY_MEDIUM } from "@/types/status";

interface TeacherCommissionBadgeProps {
    value: string;
    type: string;
    currency?: string;
}

export function TeacherCommissionBadge({ value, type, currency }: TeacherCommissionBadgeProps) {
    // Format number to remove unnecessary trailing zeros (25.00 -> 25, 25.5 -> 25.5)
    const numValue = parseFloat(value);
    const formattedValue = numValue.toString();
    
    const displayValue = type === "fixed" 
        ? currency ? `${formattedValue} ${currency}` : formattedValue
        : `${formattedValue}%`;

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
