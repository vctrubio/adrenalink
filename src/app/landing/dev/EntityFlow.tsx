"use client";

import { ENTITY_DATA } from "@/config/entities";

const tailwindColorMap: Record<string, string> = {
    "bg-indigo-300": "#e0e7ff",
    "bg-yellow-300": "#fef3c7",
    "bg-amber-300": "#fef9c3",
    "bg-orange-200": "#ffedd5",
    "bg-green-300": "#d1fae5",
    "bg-emerald-300": "#d1fae5",
    "bg-blue-300": "#dbeafe",
    "bg-foreground-300": "#e0e7ff",
    "bg-cyan-300": "#e0e7ff",
    "bg-purple-300": "#e9d5ff",
    "bg-sand-200": "#fef3c7",
    "bg-sand-300": "#fef3c7",
    "bg-slate-300": "#f1f5f9",
    "bg-amber-400": "#fcd34d",
    "bg-gray-300": "#e5e7eb",
    "bg-blue-300": "#bbf7d0",
    "bg-sky-300": "#bae6fd",
    "bg-pink-300": "#fbcfe8",
    "bg-red-300": "#fecaca",
    "bg-teal-300": "#99f6e4",
};

type EntityFlowProps = {
    entities: string[];
    arrows?: string[];
};

export function EntityFlow({ entities, arrows = [] }: EntityFlowProps) {
    const getEntity = (id: string) => ENTITY_DATA.find((e) => e.id === id);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {entities.map((entityId, index) => {
                const entity = getEntity(entityId);
                if (!entity) return null;
                const bgColorHex = tailwindColorMap[entity.bgColor] || "#e0e7ff";

                return (
                    <div key={entityId} className="flex items-center gap-2">
                        <>label was here</>
                        {index < entities.length - 1 && <span className="text-muted-foreground text-sm font-medium">{arrows[index] || "→"}</span>}
                    </div>
                );
            })}
        </div>
    );
}
