import { type ReactNode } from "react";
import { Clock } from "lucide-react";

type TimesheetGroupProps = {
    title: string;
    trackerCount: number;
    totalDuration: string;
    children: ReactNode;
};

export function TimesheetGroup({ title, trackerCount, totalDuration, children }: TimesheetGroupProps) {
    return (
        <div className="border-b border-white/10 last:border-b-0">
            <div className="flex items-center justify-between px-6 py-4 bg-white/5">
                <h3 className="text-sm font-semibold text-white/80">{title}</h3>
                <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{trackerCount} Tracker{trackerCount !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{totalDuration}</span>
                    </div>
                </div>
            </div>
            <div className="divide-y divide-white/10">
                {children}
            </div>
        </div>
    );
}
