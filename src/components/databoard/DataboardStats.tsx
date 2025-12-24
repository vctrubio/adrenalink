"use client";

import { memo } from "react";
import { type StatItem } from "@/src/components/ui/row";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";

interface DataboardStatsProps {
    stats: StatItem[];
    isLoading?: boolean;
}

export const DataboardStats = memo(function DataboardStats({ stats, isLoading = false }: DataboardStatsProps) {
    if (isLoading) {
        return (
            <div className="flex gap-3 items-center overflow-x-auto pb-2 px-4 py-3 scrollbar-hide">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 h-20 w-28 bg-gradient-to-br from-muted to-muted/50 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats || stats.length === 0) {
        return null;
    }

    return (
        <div className="flex gap-3 items-center overflow-x-auto pb-2 px-4 py-3 scrollbar-hide">
            {stats.map((stat, index) => (
                <div key={index} className="flex-shrink-0 group cursor-default transition-all duration-300 hover:scale-105">
                    <div
                        className="h-20 w-28 rounded-lg border border-border/50 backdrop-blur-sm p-3 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300"
                        style={{
                            background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                            borderColor: `${stat.color}40`,
                        }}
                    >
                        {/* Label */}
                        {stat.label && <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>}

                        {/* Icon + Value */}
                        <div className="flex items-center gap-1" style={{ color: stat.color }}>
                            <span className="w-5 h-5 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full opacity-80 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                            <span className="text-lg font-bold">
                                <AnimatedCounter value={stat.value} />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});
