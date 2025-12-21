"use client";

import { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataboardRowsSection } from "./ClientDataHeader";
import type { StatItem } from "@/src/components/ui/row";

interface DataboardPageClientProps<T> {
    entityId: string;
    data: T[];
    rowComponent: ComponentType<{ item: T }>;
    calculateStats: (data: T[]) => StatItem[];
    schoolId?: string;
}

export function DataboardPageClient<T>({
    entityId,
    data,
    rowComponent,
    calculateStats,
    schoolId,
}: DataboardPageClientProps<T>) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={entityId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                <DataboardRowsSection entityId={entityId} data={data} rowComponent={rowComponent} calculateStats={calculateStats} schoolId={schoolId} />
            </motion.div>
        </AnimatePresence>
    );
}
