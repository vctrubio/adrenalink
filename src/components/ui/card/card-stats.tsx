interface CardStatsProps {
    stats: Array<{
        icon: React.ComponentType<{ className?: string }>;
        value: string | number;
    }>;
    accentColor?: string;
    isActionable?: boolean;
}

export const CardStats = ({ stats, accentColor = "#3b82f6", isActionable = false }: CardStatsProps) => {
    return (
        <div className="absolute -top-2 -right-2 z-10">
            <div className="flex rounded-bl-xl rounded-tr-xl shadow-xl overflow-hidden pr-2 pb-1 pt-2.5 text-white" style={{ backgroundColor: accentColor }}>
                {stats.map((stat, index) => {
                    const StatIcon = stat.icon;
                    return (
                        <div key={index} className={`flex items-center gap-1 px-2.5 py-2 ${isActionable ? "cursor-pointer group" : ""}`}>
                            <StatIcon className={`w-4 h-4 transition-colors duration-300 ${isActionable ? "group-hover:text-slate-900" : ""}`} />
                            <span className={`text-sm font-bold transition-colors duration-300 ${isActionable ? "group-hover:text-slate-900" : ""}`}>{stat.value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
