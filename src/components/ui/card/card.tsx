import { ReactNode } from "react";
import { CardStats } from "./card-stats";

interface CardProps {
    children: ReactNode;
    accentColor?: string;
    className?: string;
    stats?: Array<{
        icon: React.ComponentType<{ className?: string }>;
        value: string | number;
    }>;
    isActionable?: boolean;
}

export const Card = ({ children, accentColor = "#3b82f6", className = "", stats, isActionable = false }: CardProps) => {
    return (
        <div className={className || "max-w-md mx-auto"}>
            <div
                className="relative rounded-2xl overflow-hidden border-2 shadow-2xl backdrop-blur-xl"
                style={{
                    borderColor: accentColor,
                    boxShadow: `0 20px 60px ${accentColor}40, 0 0 0 4px ${accentColor}20`,
                }}
            >
                {stats && <CardStats stats={stats} accentColor={accentColor} isActionable={isActionable} />}
                <div className="p-8 bg-slate-900/80 text-white">{children}</div>
            </div>
        </div>
    );
};
