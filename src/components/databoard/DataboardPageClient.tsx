"use client";

import { ComponentType } from "react";
import { DataboardRowsSection } from "./ClientDataHeader";
import { DataboardTableSection, type TableRenderers } from "./DataboardTableSection";
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
    
    if (renderers) {
        return (
            <DataboardTableSection
                entityId={entityId}
                data={data as any}
                renderers={renderers}
                calculateStats={calculateStats}
            />
        );
    }

    if (rowComponent) {
        return (
            <DataboardRowsSection
                entityId={entityId}
                data={data as any}
                rowComponent={rowComponent as any}
                calculateStats={calculateStats}
            />
        );
    }

    return <div>Missing row configuration</div>;
}
