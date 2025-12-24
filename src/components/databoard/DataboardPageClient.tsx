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
}

export function DataboardPageClient<T>({
    entityId,
    data,
    rowComponent,
    calculateStats,
}: DataboardPageClientProps<T>) {
    return (
        <DataboardRowsSection 
            entityId={entityId} 
            data={data} 
            rowComponent={rowComponent} 
            calculateStats={calculateStats} 
        />
    );
}
