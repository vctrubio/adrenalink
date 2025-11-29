"use client";

import { Calendar, Clock, BookOpen } from "lucide-react";

interface StatItem {
    icon: string;
    label: string;
    value: string | number;
    color?: string;
}

interface StatsCardProps {
    title: string;
    stats: StatItem[];
}

function getIcon(iconName: string) {
    const icons: Record<string, React.ElementType> = {
        calendar: Calendar,
        clock: Clock,
        "book-open": BookOpen,
    };
    return icons[iconName] || Calendar;
}

export function StatsCard({ title, stats }: StatsCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                    const Icon = getIcon(stat.icon);
                    return (
                        <div
                            key={index}
                            className="bg-background border-l-4 rounded-r-lg p-4 flex flex-col items-center justify-center text-center"
                            style={{ borderColor: stat.color || "var(--border)" }}
                        >
                            <Icon className="w-8 h-8 mb-2" style={{ color: stat.color || "var(--foreground)" }} />
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
