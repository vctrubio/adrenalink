import { ReactNode } from "react";
import { CardStats } from "./card-stats";

interface CardProps {
    children: ReactNode;
    accentColor?: string;
    className?: string;
    stats?: {
        icon: React.ComponentType<{ className?: string }>;
        value: string | number;
        href?: string;
    }[];
    isActionable?: boolean;
}

export const Card = ({ children, accentColor = "#3b82f6", className = "", stats, isActionable = false }: CardProps) => {
    return (
        <div className={className || "max-w-md mx-auto"}>
            <div
                className="relative rounded-2xl overflow-hidden border-2"
                style={{
                    borderColor: accentColor,
                }}
            >
                {stats && <CardStats stats={stats} accentColor={accentColor} isActionable={isActionable} />}
                <div className="p-4 bg-card text-card-foreground">{children}</div>
            </div>
        </div>
    );
};
