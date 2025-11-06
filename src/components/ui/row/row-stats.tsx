import { ReactNode } from "react";

export interface StatItem {
    icon: ReactNode;
    value: string | number;
}

interface RowStatsProps {
    stats: StatItem[];
    entityColor: string;
}

export const RowStats = ({ stats, entityColor }: RowStatsProps) => {
    return (
        <div className="flex items-center gap-2">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div className={`w-5 h-5 ${entityColor}`}>
                        {stat.icon}
                    </div>
                    <span className="text-sm font-medium">{stat.value}</span>
                </div>
            ))}
        </div>
    );
};
