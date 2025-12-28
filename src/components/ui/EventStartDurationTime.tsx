import { getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";

interface EventStartDurationTimeProps {
    date: string;
    duration: number;
    className?: string;
}

export function EventStartDurationTime({ date, duration, className = "" }: EventStartDurationTimeProps) {
    const startTime = getTimeFromISO(date);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Main Time */}
            <span className="text-4xl font-black tracking-tighter leading-none">{startTime}</span>
            
            {/* Label and Duration */}
            <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-60">
                    Start
                </span>
                <span className="text-sm font-bold mt-1 leading-none whitespace-nowrap opacity-80">
                    +{getHMDuration(duration)}
                </span>
            </div>
        </div>
    );
}