interface LabelTagProps {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    title: string;
    description: readonly string[];
    borderColor: string;
    textColor: string;
}

export default function LabelTag({ icon: Icon, title, description, borderColor, textColor }: LabelTagProps) {
    // Extract the color value from the Tailwind class for inline style
    const getBorderStyle = (colorClass: string) => {
        const colorMap: Record<string, string> = {
            "border-indigo-500": "#6366f1",
            "border-yellow-500": "#eab308",
            "border-green-500": "#22c55e",
            "border-emerald-500": "#10b981",
            "border-purple-500": "#a855f7",
            "border-slate-500": "#64748b",
            "border-orange-500": "#f97316",
            "border-blue-500": "#3b82f6",
            "border-cyan-500": "#06b6d4",
            "border-teal-500": "#14b8a6",
            "border-amber-500": "#f59e0b",
        };
        return colorMap[colorClass] || "#6b7280";
    };

    return (
        <div className="border-2 rounded-lg p-6" style={{ borderColor: getBorderStyle(borderColor) }}>
            <div className="flex items-center gap-4 mb-4">
                <Icon size={32} className={textColor} />
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                </div>
            </div>
            <div className="text-muted-foreground">
                {description.map((desc, index) => (
                    <p key={index}>{desc}</p>
                ))}
            </div>
        </div>
    );
}
