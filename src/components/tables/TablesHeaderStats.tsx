"use client";

import { StatHeaderItemUI, type StatType } from "@/backend/RenderStats";

export interface TableStat {
    type: StatType;
    value: string | number;
    label?: string;
    variant?: "default" | "profit";
}

export function TablesHeaderStats({ stats }: { stats: TableStat[] }) {
    if (!stats || stats.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 bg-muted/30 rounded-xl border border-border/50">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center" title={stat.label}>
                    <StatHeaderItemUI 
                        statType={stat.type} 
                        value={stat.value} 
                        hideLabel={true}
                        variant={stat.variant}
                    />
                    {index < stats.length - 1 && (
                        <div className="ml-6 h-4 w-px bg-border/60 rotate-12" />
                    )}
                </div>
            ))}
        </div>
    );
}