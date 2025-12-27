"use client";

import { memo } from "react";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import type { StatItem } from "@/src/components/ui/row";

interface DataboardHeaderStatsProps {
    stats: StatItem[];
    isLoading?: boolean;
}

export const DataboardHeaderStats = memo(function DataboardHeaderStats({ stats, isLoading = false }: DataboardHeaderStatsProps) {
    if (isLoading) {
        return (
            <div className="flex items-center bg-muted/30 rounded-2xl p-1.5 gap-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-2">
                        <div className="w-3.5 h-3.5 bg-muted rounded animate-pulse" />
                        <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (!stats || stats.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center bg-muted/30 rounded-2xl p-1.5 gap-1">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`flex items-center gap-1.5 px-3 py-2 font-bold group relative ${index > 0 ? "border-l border-border/50 pl-4" : ""}`}
                    title={stat.label}
                >
                    <div style={{ color: stat.color }} className="flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
                        {stat.icon}
                    </div>
                    <span style={{ color: stat.color }} className="text-sm">
                        {typeof stat.value === "number" ? (
                            <AnimatedCounter value={stat.value} formatter={(num) => num.toLocaleString()} />
                        ) : (
                            stat.value
                        )}
                    </span>

                    {/* Tooltip */}
                    {stat.label && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                            {stat.label}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});
