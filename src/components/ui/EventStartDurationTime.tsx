import { getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";

interface EventStartDurationTimeProps {
    date: string;
    duration: number;
}

export function EventStartDurationTime({ date, duration }: EventStartDurationTimeProps) {
    const startTime = getTimeFromISO(date);

    return (
        <div className="flex items-center gap-2">
            <span className="text-4xl font-black tracking-tighter leading-none text-foreground">{startTime}</span>
            <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Start</span>
                <span className="text-sm font-bold text-foreground/80 mt-1 leading-none whitespace-nowrap">+{getHMDuration(duration)}</span>
            </div>
        </div>
    );
}
