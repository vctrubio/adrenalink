"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";

interface BankCalculatorTagProps {
    icon: React.ReactNode;
    revenue: number;
    expenses: number;
    bgColor: string;
    color: string;
}

export const BankCalculatorTag = ({ icon, revenue, expenses, bgColor, color }: BankCalculatorTagProps) => {
    const profit = revenue - expenses;
    const isPositive = profit >= 0;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 transition-all hover:border-border" style={{ backgroundColor: `${bgColor}15` }}>
            <div style={{ color }}>{icon}</div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-muted-foreground/60">{revenue.toFixed(0)}</span>
                <span className="text-muted-foreground/40">-</span>
                <span className="text-muted-foreground/60">{expenses.toFixed(0)}</span>
                <span className="text-muted-foreground/40">=</span>
                <span className={`font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {Math.abs(profit).toFixed(0)}
                </span>
            </div>
        </div>
    );
};
