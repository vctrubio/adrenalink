interface EntityStat {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    color: string;
}

interface EntityInfoCardProps {
    entity: {
        id: string;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
        bgColor: string;
    };
    status?: string;
    stats: [EntityStat, EntityStat, EntityStat];
    fields: Array<{
        label: string;
        value: string | number;
    }>;
    accentColor: string;
}

export const EntityInfoCard = ({ entity, status = "Entity", stats, fields, accentColor }: EntityInfoCardProps) => {
    const Icon = entity.icon;

    return (
        <div className="max-w-md mx-auto">
            {/* Card Container */}
            <div
                className="relative rounded-2xl overflow-hidden border-2 shadow-2xl backdrop-blur-xl"
                style={{
                    borderColor: accentColor,
                    boxShadow: `0 20px 60px ${accentColor}40, 0 0 0 4px ${accentColor}20`,
                }}
            >
                {/* Stats - Top Right Corner */}
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="flex rounded-bl-xl rounded-tr-xl shadow-xl overflow-hidden pr-2 py-1" style={{ backgroundColor: accentColor }}>
                        {stats.map((stat, index) => {
                            const StatIcon = stat.icon;
                            return (
                                <div key={index} className="flex items-center gap-1 px-2.5 py-2">
                                    <StatIcon className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">{stat.value}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-8 bg-slate-900/80 dark:bg-slate-900/80">
                    {/* Top Section - Icon and Status */}
                    <div className="flex items-center gap-6 mb-6">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: `${accentColor}20`,
                                border: `3px solid ${accentColor}`,
                            }}
                        >
                            <Icon className={`w-10 h-10 ${entity.color}`} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white">{entity.name}</h3>
                            <div className="text-xs uppercase tracking-wider text-white/60 mb-1">{status}</div>
                        </div>
                    </div>

                    {/* Colored Divider */}
                    <div className="h-1 w-full rounded-full mb-6" style={{ backgroundColor: accentColor }} />

                    {/* Fields Section - Form-like */}
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-xs uppercase tracking-wider text-white/60">{field.label}</span>
                                <span className="text-sm font-medium text-white">{field.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
