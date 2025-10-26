"use client";

import { useState } from "react";
import type { EntityConfig } from "@/config/entities";
import { EntityCard } from "@/src/components/cards/EntityCard";

export const BETA_ENTITY_IDS = ["student", "teacher", "commission", "schoolPackage", "booking", "equipment", "lesson", "event"] as const;

type ViewMode = "full" | "beta";

type SerializableEntity = Omit<EntityConfig, "icon">;

type TableClientProps = {
    entities: SerializableEntity[];
};

function CountDuration({ count = 4, duration = 16 }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 flex items-center justify-center">
            {/* Count Section - Left */}
            <div className="flex items-center space-x-4">
                <div className="text-left">
                    <div className="text-3xl font-bold text-right text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 mt-1">events</div>
                </div>
            </div>

            {/* Separator */}
            <div className="h-12 w-px bg-gray-300 mx-2"></div>

            {/* Duration Section - Right */}
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{duration}</div>
                    <div className="text-sm text-gray-600 mt-1">hours</div>
                </div>
            </div>
        </div>
    );
}

// Usage examples:
// CountDuration({ count: 4, duration: 16, unit: 'hours' })
// CountDuration({ count: 1, duration: 2, unit: 'hours' })
// -------------------------
// Main TableClient
// -------------------------
export default function TableClient({ entities }: TableClientProps) {
    const [mode, setMode] = useState<ViewMode>("beta");

    const filteredEntities = mode === "beta" ? entities.filter((entity) => BETA_ENTITY_IDS.includes(entity.id as any)) : entities;

    return (
        <div className="p-8">
            {/* <CountDuration /> */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">Entity Databoard</h1>

                {/* Mode Toggle */}
                <div className="flex gap-2 bg-muted rounded-lg p-1">
                    <button onClick={() => setMode("beta")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "beta" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        Beta
                    </button>
                    <button onClick={() => setMode("full")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "full" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        Full
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {filteredEntities.map((entity) => {
                    return <EntityCard key={entity.id} entityId={entity.id} count={entity.count} />;
                })}
            </div>
        </div>
    );
}
