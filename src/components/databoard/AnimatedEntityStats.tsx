"use client";

import { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataboardStats } from "./DataboardStats";
import type { StatItem } from "@/src/components/ui/row";

interface AnimatedEntityStatsProps {
    entityId: string;
    stats: StatItem[];
    isLoading?: boolean;
}

// Create a stable key from stats without expensive JSON.stringify
function createStatsKey(entityId: string, stats: StatItem[]): string {
    if (stats.length === 0) return `${entityId}-empty`;
    // Use a simple hash of values instead of full JSON.stringify
    const valuesHash = stats.map(s => String(s.value)).join("|");
    return `${entityId}-${stats.length}-${valuesHash.slice(0, 50)}`;
}

export const AnimatedEntityStats = memo(function AnimatedEntityStats({ entityId, stats, isLoading = false }: AnimatedEntityStatsProps) {
    const statsKey = useMemo(() => createStatsKey(entityId, stats), [entityId, stats]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={statsKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex-shrink-0"
            >
                <DataboardStats stats={stats} isLoading={isLoading} />
            </motion.div>
        </AnimatePresence>
    );
});

