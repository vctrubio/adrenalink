"use client";

import { useMemo } from "react";
import type { EntityStats } from "./StatsBarChart";

type EntityComparisonViewProps = {
    stats: EntityStats[];
    selectedEntities: string[];
};

export function EntityComparisonView({ stats, selectedEntities }: EntityComparisonViewProps) {
    const comparisonData = useMemo(() => {
        const data = selectedEntities.length > 0 
            ? stats.filter((s) => selectedEntities.includes(s.id)) 
            : stats;
        
        return data.sort((a, b) => b.count - a.count);
    }, [stats, selectedEntities]);

    const totalCount = comparisonData.reduce((sum, s) => sum + s.count, 0);

    if (comparisonData.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Entity Comparison</h3>
                <p className="text-sm text-muted-foreground">
                    {selectedEntities.length > 0 
                        ? `Comparing ${comparisonData.length} selected entities` 
                        : `Showing all ${comparisonData.length} entities`}
                </p>
            </div>

            <div className="space-y-3">
                {comparisonData.map((entity) => {
                    const Icon = entity.icon;
                    const percentage = ((entity.count / totalCount) * 100).toFixed(1);

                    return (
                        <div key={entity.id} className="space-y-2">
                            {/* Entity Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor: entity.bgColor + "40",
                                        }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: entity.color }} />
                                    </div>
                                    <span className="text-sm font-semibold text-white">{entity.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                                    <span className="text-sm font-bold text-white w-12 text-right">
                                        {entity.count}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: entity.color,
                                        opacity: 0.8,
                                    }}
                                />
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        background: `linear-gradient(to right, ${entity.color}00, ${entity.color})`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-white">{totalCount}</span>
                </div>
            </div>
        </div>
    );
}
