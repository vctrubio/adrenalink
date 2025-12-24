"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataboardStats } from "./DataboardStats";
import type { StatItem } from "@/src/components/ui/row";

interface AnimatedEntityStatsProps {
    entityId: string;
    stats: StatItem[];
    isLoading?: boolean;
}

export const AnimatedEntityStats = memo(function AnimatedEntityStats({ entityId, stats, isLoading = false }: AnimatedEntityStatsProps) {
    // We only use the entityId as the key. This ensures the component only remounts
    // when we switch pages/entities, but STAYS MOUNTED when only the stats data updates.
    
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={entityId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
            >
                <DataboardStats stats={stats} isLoading={isLoading} />
            </motion.div>
        </AnimatePresence>
    );
});