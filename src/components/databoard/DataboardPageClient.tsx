"use client";

import { ComponentType, useMemo } from "react";
import { DataboardRowsSection } from "./ClientDataHeader";
import { DataboardTableSection, type TableRenderers } from "./DataboardTableSection";
import { useTeacherSortOrder } from "@/src/providers/teacher-sort-order-provider";
import type { StatItem } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models/AbstractModel";

interface DataboardPageClientProps<T extends { id: string }> {
    entityId: string;
    data: T[]; // AbstractModel<T>[] essentially
    rowComponent?: ComponentType<{ item: any }>; // making optional
    renderers?: TableRenderers<AbstractModel<T>>; // New prop
    calculateStats: (data: any[]) => StatItem[];
}

export function DataboardPageClient<T extends { id: string }>({
    entityId,
    data,
    rowComponent,
    renderers,
    calculateStats
}: DataboardPageClientProps<T>) {
    const { order: teacherSortOrder } = useTeacherSortOrder();

    const sortedData = useMemo(() => {
        if (entityId !== "teacher" || !teacherSortOrder || teacherSortOrder.length === 0) {
            return data;
        }

        return [...data].sort((a, b) => {
            const aIndex = teacherSortOrder.indexOf((a as any).schema?.id || "");
            const bIndex = teacherSortOrder.indexOf((b as any).schema?.id || "");
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [data, entityId, teacherSortOrder]);

    if (renderers) {
        return (
            <DataboardTableSection
                entityId={entityId}
                data={sortedData as any}
                renderers={renderers}
                calculateStats={calculateStats}
            />
        );
    }

    if (rowComponent) {
        return (
            <DataboardRowsSection
                entityId={entityId}
                data={sortedData as any}
                rowComponent={rowComponent as any}
                calculateStats={calculateStats}
            />
        );
    }

    return <div>Missing row configuration</div>;
}
