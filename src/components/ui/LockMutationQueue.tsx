import React from "react";
import { Lock, LockOpen, Check, Zap } from "lucide-react";

interface LockMutationQueueProps {
    isLocked: boolean;
    onToggle: () => void;
    isOptimised: boolean;
    optimisationStats: { adjusted: number; total: number };
    onOptimise: () => void;
    className?: string;
}

/**
 * LockMutationQueue - Consolidated single-row adjustment controls
 * 
 * Left: Optimisation ratio and status (clickable to optimize)
 * Right: Lock/Unlock toggle (enabled when optimised)
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
        <div className={`flex items-stretch gap-1.5 h-9 ${className}`}>
            {/* Left: Optimisation Status / Action */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onOptimise();
                }}
                disabled={isOptimised && isLocked}
                className={`flex-1 flex items-center justify-center gap-2 px-3 rounded-xl border transition-all duration-200 ${
                    isOptimised && isLocked
                        ? "bg-green-500/10 border-green-500/30 text-green-500/80 cursor-default"
                        : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-500 active:scale-95 cursor-pointer shadow-sm"
                }`}
            >
                {isOptimised ? (
                    <Check size={14} className="shrink-0" />
                ) : (
                    <Zap size={14} className="shrink-0 fill-current" />
                )}
                <span className="text-[10px] font-black uppercase tracking-wider">
                    {optimisationStats.adjusted}/{optimisationStats.total} Optimised
                </span>
            </button>

            {/* Right: Lock Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                disabled={!isOptimised}
                className={`w-11 flex items-center justify-center rounded-xl transition-all duration-200 border ${
                    !isOptimised
                        ? "bg-muted/30 text-muted-foreground/30 border-transparent cursor-not-allowed"
                        : isLocked
                            ? "bg-cyan-600 text-white border-cyan-700 shadow-md hover:bg-cyan-700 active:scale-95 cursor-pointer"
                            : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
                }`}
                title={isLocked ? "Locked: Changes cascade" : "Unlocked: Respect times"}
            >
                {isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
            </button>
        </div>
    );
}
