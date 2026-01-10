"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { SpinAdranalink } from "@/src/components/ui/SpinAdranalink";

interface ControllerActionsProps {
    onSubmit: () => void;
    onReset: () => void;
    loading: boolean;
    canSubmit: boolean;
    submitLabel: string;
    resetLabel?: string;
    error?: string | null;
}

export function ControllerActions({
    onSubmit,
    onReset,
    loading,
    canSubmit,
    submitLabel,
    resetLabel = "Cancel",
    error,
}: ControllerActionsProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="space-y-6 pt-4">
            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl text-xs font-bold text-destructive flex items-center gap-3 overflow-hidden"
                    >
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={onSubmit}
                    disabled={!canSubmit || loading}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`
                        relative w-full h-14 rounded-full font-bold text-sm tracking-wide
                        transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group
                        ${
                            canSubmit && !loading
                                ? "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }
                    `}
                >
                    <SpinAdranalink
                        isSpinning={loading || (canSubmit && isHovered)}
                        duration={loading ? 0.5 : 0.8}
                        size={20}
                        color={canSubmit && !loading ? "text-background" : "text-foreground"}
                    />

                    <span>{loading ? "Processing..." : submitLabel}</span>

                    {!loading && canSubmit && (
                        <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                    )}
                </button>

                <button
                    onClick={onReset}
                    disabled={loading}
                    className="w-full h-12 rounded-full text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={14} strokeWidth={2.5} />
                    {resetLabel}
                </button>
            </div>
        </div>
    );
}
