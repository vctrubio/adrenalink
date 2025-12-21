"use client";

import { useLayoutEffect, useRef, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataboardRowsSection } from "./ClientDataHeader";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import type { StatItem } from "@/src/components/ui/row";

interface DataboardPageClientProps<T> {
    entityId: string;
    data: T[];
    rowComponent: ComponentType<{ item: T }>;
    calculateStats: (data: T[]) => StatItem[];
}

export function DataboardPageClient<T>({
    entityId,
    data,
    rowComponent,
    calculateStats,
}: DataboardPageClientProps<T>) {
    const controller = useDataboardController();
    const prevStatsRef = useRef<StatItem[]>([]);

    useLayoutEffect(() => {
        if (controller.onStatsChange) {
            const stats = calculateStats(data);
            const hasChanged = JSON.stringify(stats) !== JSON.stringify(prevStatsRef.current);
            if (hasChanged) {
                prevStatsRef.current = stats;
                controller.onStatsChange(stats);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={entityId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                <DataboardRowsSection entityId={entityId} data={data} rowComponent={rowComponent} />
            </motion.div>
        </AnimatePresence>
    );
}
