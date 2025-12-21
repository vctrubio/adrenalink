import { ReactNode } from "react";

export interface StatItem {
    icon: ReactNode;
    value: string | number;
    color: string;
    label?: string;
}

interface RowStatsProps {
    stats: StatItem[];
}

export const RowStats = ({ stats }: RowStatsProps) => {
    const filteredStats = stats.filter(stat => {
        if (typeof stat.value === "string") {
            return stat.value.length > 0 && stat.value !== "0 mins";
        }
        return stat.value > 0;
    });

    if (filteredStats.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {filteredStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-0.5">
                    <div className="w-5 h-5" style={{ color: stat.color }}>
                        {stat.icon}
                    </div>
                    <span className="text-sm font-medium">{stat.value}</span>
                </div>
            ))}
        </div>
    );
};
