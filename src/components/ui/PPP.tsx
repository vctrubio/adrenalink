import { getPricePerHour } from "@/getters/package-getter";
import { getPPP } from "@/getters/integer-getter";

interface PPPProps {
    pricePerStudent: number;
    capacityStudents: number;
    durationMinutes: number;
    className?: string;
    variant?: "default" | "duration-match";
}

/**
 * PPP (Price Per Period) Component
 * Displays price and price per hour, but only shows price per hour if duration is not 1 hour
 * Always formats numbers to 2 decimals
 * variant="duration-match" matches the duration styling (larger, monospace)
 */
export function PPP({ pricePerStudent, capacityStudents, durationMinutes, className = "", variant = "default" }: PPPProps) {
    const totalPrice = pricePerStudent * capacityStudents;
    const pricePerHour = getPricePerHour(pricePerStudent, capacityStudents, durationMinutes);
    const isOneHour = durationMinutes === 60;

    if (variant === "duration-match") {
        return (
            <div className={`flex items-baseline justify-end gap-1 ${className}`}>
                <span className="font-mono text-base font-semibold text-foreground">{getPPP(totalPrice)}</span>
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">total</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-end gap-1 ${className}`}>
            {/* Total Price - Main */}
            <div className="flex items-baseline gap-1">
                <span className="font-mono text-base font-semibold text-foreground">{getPPP(totalPrice)}</span>
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">total</span>
            </div>
            {/* Price Per Hour - Secondary */}
            {!isOneHour && (
                <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm font-medium text-muted-foreground">{getPPP(pricePerHour)}</span>
                    <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">/h</span>
                </div>
            )}
        </div>
    );
}
