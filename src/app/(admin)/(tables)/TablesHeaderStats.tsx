"use client";

import React from "react";
import { StatItemUI, type StatType } from "@/backend/data/StatsData";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { getCompactNumber } from "@/getters/integer-getter";
import { getHMDuration } from "@/getters/duration-getter";

export interface TableStat {
    type: StatType;
    value: string | number;
    label?: string;
    variant?: "default" | "profit";
    desc?: string;
}

const MONEY_TYPES = [
    "revenue",
    "profit",
    "loss",
    "payments",
    "studentPayments",
    "teacherPayments",
    "commission",
    "balance",
    "moneyToPay",
    "moneyPaid",
    "studentBalance",
];

export function TablesHeaderStats({ stats }: { stats: TableStat[] }) {
    if (!stats || stats.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center bg-muted/30 rounded-2xl p-1.5 gap-1 border border-border/50 w-fit">
            {stats.map((stat, index) => {
                const isMoney = MONEY_TYPES.includes(stat.type);
                const isDuration = stat.type === "duration";
                const rawValue = typeof stat.value === "string" ? parseFloat(stat.value) : stat.value;
                const canAnimate = !isNaN(rawValue as number);

                return (
                    <div key={index} className="flex items-center relative group/stat">
                        <div className="flex items-center px-4 py-2">
                            <StatItemUI
                                type={stat.type}
                                value={
                                    canAnimate && !isMoney ? (
                                        <AnimatedCounter
                                            value={rawValue as number}
                                            formatter={(num) => {
                                                if (isMoney) return getCompactNumber(num);
                                                if (isDuration) return getHMDuration(num);
                                                return Math.round(num).toLocaleString();
                                            }}
                                        />
                                    ) : (
                                        isMoney ? getCompactNumber(rawValue as number) : isDuration ? getHMDuration(rawValue as number) : Math.round(rawValue as number).toLocaleString()
                                    )
                                }
                                labelOverride={stat.label}
                                hideLabel={true}
                                variant={stat.variant === "profit" ? "profit" : "default"}
                                iconColor={true}
                                className="text-sm tracking-widest font-black uppercase"
                            />
                        </div>
                        {stat.desc && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-border shadow-md opacity-0 group-hover/stat:opacity-100 transition-all pointer-events-none z-50 mb-1 whitespace-nowrap">
                                {stat.desc}
                            </span>
                        )}
                        {index < stats.length - 1 && <div className="h-4 w-px bg-border/60 rotate-[25deg] mx-1" />}
                    </div>
                );
            })}
        </div>
    );
}
