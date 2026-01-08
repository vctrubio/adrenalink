"use client";

import React from "react";
import { StatItemUI, type StatType } from "@/backend/data/StatsData";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { getCompactNumber } from "@/getters/integer-getter";

export interface TableStat {
    type: StatType;
    value: string | number;
    label?: string;
    variant?: "default" | "profit";
    desc?: string;
}

const MONEY_TYPES = ["revenue", "profit", "loss", "payments", "studentPayments", "teacherPayments", "commission", "balance", "moneyToPay", "moneyPaid"];

export function TablesHeaderStats({ stats }: { stats: TableStat[] }) {
    if (!stats || stats.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center bg-muted/30 rounded-2xl p-1.5 gap-1 border border-border/50 w-fit">
            {stats.map((stat, index) => {
                const isMoney = MONEY_TYPES.includes(stat.type);
                const rawValue = typeof stat.value === "string" ? parseFloat(stat.value) : stat.value;
                const canAnimate = !isNaN(rawValue as number);

                return (
                    <div key={index} className="flex items-center">
                        <div className="flex items-center px-4 py-2">
                            <StatItemUI 
                                type={stat.type} 
                                value={canAnimate ? (
                                    <AnimatedCounter 
                                        value={rawValue as number} 
                                        formatter={(num) => isMoney ? getCompactNumber(num) : Math.round(num).toLocaleString()} 
                                    />
                                ) : (
                                    stat.value
                                )}
                                labelOverride={stat.label}
                                hideLabel={true}
                                variant={stat.variant === "profit" ? "profit" : "default"}
                                iconColor={true}
                                desc={stat.desc}
                                className="text-sm tracking-widest font-black uppercase"
                            />
                        </div>
                        {index < stats.length - 1 && (
                            <div className="h-4 w-px bg-border/60 rotate-[25deg] mx-1" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
