"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

interface GlobalFlagAdjustmentToggleProps {
    globalFlag: GlobalFlag;
    children?: React.ReactNode;
}

export default function GlobalFlagAdjustmentToggle({
    globalFlag,
    children
}: GlobalFlagAdjustmentToggleProps) {
    const isAdjustmentMode = globalFlag?.isAdjustmentMode?.();

    const handleToggle = () => {
        if (isAdjustmentMode) {
            globalFlag?.exitAdjustmentMode?.();
        } else {
            globalFlag?.enterAdjustmentMode?.();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    isAdjustmentMode
                        ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
                <Settings size={16} />
                {isAdjustmentMode ? "Exit Adjustment Mode" : "Enter Adjustment Mode"}
            </button>

            {/* Children Content */}
            <AnimatePresence>
                {isAdjustmentMode && children && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
