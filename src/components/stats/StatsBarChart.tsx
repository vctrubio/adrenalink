"use client";

import { useMemo } from "react";

export type EntityStats = {
    id: string;
    name: string;
    count: number;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    relations: string[];
};

type StatsBarChartProps = {
    stats: EntityStats[];
    selectedEntities: string[];
    highlightedEntity: string | null;
    onEntityClick: (entityId: string) => void;
    onEntityHover: (entityId: string | null) => void;
};

export function StatsBarChart({ stats, selectedEntities, highlightedEntity, onEntityClick, onEntityHover }: StatsBarChartProps) {
    const maxCount = useMemo(() => Math.max(...stats.map((s) => s.count), 1), [stats]);

    const getBarHeight = (count: number) => {
        return (count / maxCount) * 100;
    };

    const isEntityRelated = (entityId: string) => {
        if (!highlightedEntity) return false;
        const highlighted = stats.find((s) => s.id === highlightedEntity);
        return highlighted?.relations.includes(entityId) || false;
    };

    const isEntitySelected = (entityId: string) => {
        return selectedEntities.includes(entityId);
    };

    return (
        <div className="w-full h-[500px] bg-slate-900/50 rounded-2xl p-8 border border-slate-700">
            {/* Chart Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Entity Distribution</h2>
                <p className="text-sm text-muted-foreground mt-1">Click to filter, hover to see relations</p>
            </div>

            {/* Bar Chart Container */}
            <div className="h-[calc(100%-80px)] flex items-end justify-around gap-2 px-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const barHeight = getBarHeight(stat.count);
                    const isSelected = isEntitySelected(stat.id);
                    const isRelated = isEntityRelated(stat.id);
                    const isHighlighted = highlightedEntity === stat.id;
                    const isVisible = selectedEntities.length === 0 || isSelected;

                    return (
                        <div
                            key={stat.id}
                            className="flex flex-col items-center gap-2 flex-1 max-w-[120px] cursor-pointer group"
                            onClick={() => onEntityClick(stat.id)}
                            onMouseEnter={() => onEntityHover(stat.id)}
                            onMouseLeave={() => onEntityHover(null)}
                        >
                            {/* Count Label */}
                            <div
                                className={`
                  text-lg font-bold transition-all duration-300
                  ${isVisible ? "opacity-100" : "opacity-30"}
                  ${isHighlighted ? "scale-125 text-white" : ""}
                `}
                                style={{ color: isVisible ? stat.color : "#64748b" }}
                            >
                                {stat.count}
                            </div>

                            {/* Bar */}
                            <div className="relative w-full h-full flex items-end">
                                <div
                                    className={`
                    w-full rounded-t-lg transition-all duration-500 relative overflow-hidden
                    ${isVisible ? "" : "opacity-30"}
                    ${isHighlighted ? "ring-4 ring-white/50 scale-105" : ""}
                    ${isRelated ? "ring-2 ring-secondary" : ""}
                    ${isSelected ? "ring-2 ring-white" : ""}
                  `}
                                    style={{
                                        height: `${barHeight}%`,
                                        backgroundColor: stat.bgColor,
                                        minHeight: "40px",
                                    }}
                                >
                                    {/* Bar Gradient Effect */}
                                    <div
                                        className="absolute inset-0 opacity-60"
                                        style={{
                                            background: `linear-gradient(to top, ${stat.color}, ${stat.bgColor})`,
                                        }}
                                    />

                                    {/* Icon on hover */}
                                    <div
                                        className={`
                      absolute inset-0 flex items-center justify-center
                      transition-opacity duration-300
                      ${isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                                    >
                                        <Icon className="w-8 h-8" style={{ color: stat.color }} />
                                    </div>

                                    {/* Relation Count Badge */}
                                    {isRelated && (
                                        <div
                                            className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse ring-2 ring-secondary/50"
                                        >
                                            ✓
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Entity Name */}
                            <div
                                className={`
                  text-xs font-semibold text-center transition-all duration-300 mt-2
                  ${isVisible ? "text-white" : "text-slate-500"}
                  ${isHighlighted ? "scale-110" : ""}
                `}
                            >
                                {stat.name}
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
