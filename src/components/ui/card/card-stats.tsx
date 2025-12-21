interface CardStatsProps {
    stats: {
        icon: React.ComponentType<{ className?: string }>;
        value: string | number;
        href?: string;
    }[];
    accentColor?: string;
    isActionable?: boolean;
}

export const CardStats = ({ stats, accentColor = "#3b82f6", isActionable = false }: CardStatsProps) => {
    return (
        <div className="absolute -top-2 -right-2 z-10">
            <div className="flex rounded-bl-xl rounded-tr-xl shadow-xl overflow-hidden pr-2 pb-1 pt-2.5 text-white" style={{ backgroundColor: accentColor }}>
                {stats.map((stat, index) => {
                    const StatIcon = stat.icon;
                    const content = (
                        <>
                            <StatIcon className={`w-4 h-4 transition-colors duration-300 ${isActionable ? "group-hover:text-slate-900" : ""}`} />
                            <span className={`text-sm font-bold transition-colors duration-300 ${isActionable ? "group-hover:text-slate-900" : ""}`}>{stat.value}</span>
                        </>
                    );

                    if (stat.href && isActionable) {
                        return (
                            <a
                                key={index}
                                href={stat.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-2 cursor-pointer group"
                            >
                                {content}
                            </a>
                        );
                    }

                    return (
                        <div key={index} className={`flex items-center gap-1 px-2.5 py-2 ${isActionable ? "cursor-pointer group" : ""}`}>
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
