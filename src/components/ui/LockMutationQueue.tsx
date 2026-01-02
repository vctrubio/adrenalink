import React from "react";
import { Lock, Unlock } from "lucide-react";

interface LockMutationQueueProps {
    isLocked: boolean;
    onToggle: () => void;
    isOptimised: boolean;
    optimisationStats: { adjusted: number; total: number };
    onOptimise: () => void;
    className?: string;
}

/**
 * LockMutationQueue - Combined optimization status and lock toggle
 * 
 * Shows:
 * - x/y Optimised status (clickable to optimize)
 * - Lock/Unlock toggle (only enabled when optimised)
 * 
 * When locked: Mutations will ALWAYS cascade (maintain linked list)
 * When unlocked: Mutations respect times (only cascade on overlap)
 */
export function LockMutationQueue({
    isLocked,
    onToggle,
    isOptimised,
    optimisationStats,
    onOptimise,
    className = "",
}: LockMutationQueueProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {/* Optimisation Status Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onOptimise();
                }}
                disabled={isOptimised}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                    isOptimised
                        ? "bg-green-500/10 border-green-500/30 cursor-default"
                        : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 active:scale-95 cursor-pointer"
                }`}
            >
                <svg
                    className={`w-4 h-4 ${isOptimised ? "text-green-500" : "text-blue-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOptimised ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                </svg>
                <span className={`text-xs font-bold ${isOptimised ? "text-green-500" : "text-blue-500"}`}>
                    {optimisationStats.adjusted}/{optimisationStats.total} Optimised
                </span>
            </button>

            {/* Lock/Unlock Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                disabled={!isOptimised}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border-2 ${
                    !isOptimised
                        ? "bg-muted/30 text-muted-foreground/30 border-transparent cursor-not-allowed"
                        : isLocked
                            ? "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:border-secondary/30 active:scale-95 cursor-pointer"
                            : "bg-secondary/5 text-secondary/50 border-secondary/10 hover:bg-secondary/10 hover:border-secondary/20 active:scale-95 cursor-pointer"
                }`}
                title={
                    !isOptimised
                        ? "Queue must be optimised first"
                        : isLocked
                            ? "Locked: Mutations cascade (linked list maintained)"
                            : "Unlocked: Mutations respect times (cascade only on overlap)"
                }
            >
                {isLocked ? <Lock size={16} className="flex-shrink-0" /> : <Unlock size={16} className="flex-shrink-0" />}
                <span className="text-xs font-medium">{isLocked ? "Cascade on modify" : "Respect times"}</span>
            </button>
        </div>
    );
}
