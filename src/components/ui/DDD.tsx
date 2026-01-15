import { getHMDuration } from "@/getters/duration-getter";

interface DDDProps {
    durationMinutes: number;
    className?: string;
}

/**
 * DDD (Duration Display) Component
 * Displays duration using getHMDuration
 * If duration is in minutes (< 60), shows a small "m" after the number
 * Otherwise (hours), no unit suffix needed
 */
export function DDD({ durationMinutes, className = "" }: DDDProps) {
    const isMinutes = durationMinutes < 60;
    const durationText = getHMDuration(durationMinutes, false); // Get without units

    return (
        <div className={`flex items-baseline gap-1 ${className}`}>
            <span className="font-mono text-2xl font-semibold text-foreground">{durationText}</span>
            {isMinutes && (
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">m</span>
            )}
            {!isMinutes && (
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">h</span>
            )}
        </div>
    );
}
