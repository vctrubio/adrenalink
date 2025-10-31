"use client";

import Link from "next/link";
import { TABLE_CONFIG } from "@/config/tables";
import LabelTag from "@/src/components/tags/LabelTag";

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

export type EntityCardProps = {
    entityId: string;
    count?: number;
};

export function EntityCard({ entityId, count }: EntityCardProps) {
    const entity = TABLE_CONFIG.find((e) => e.id === entityId);

    if (!entity) return null;

    const { name, icon: Icon, description, bgColor, color, link, relations } = entity;
    const borderColor = tailwindColorMap[bgColor] || "#e0e7ff";

    // Get related entity data
    const relatedEntities = relations.map((relId) => TABLE_CONFIG.find((e) => e.id === relId)).filter(Boolean);

    return (
        <Link href={link} className="flex flex-col items-start w-full cursor-pointer">
            {/* Count outside the card */}
            {count !== undefined && <span className="mb-2 text-sm font-bold text-foreground">Count: {count}</span>}

            {/* Card */}
            <div className="w-full border-4 rounded-lg p-6 transition-all duration-200 shadow-md hover:shadow-lg" style={{ borderColor }}>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <Icon className={`w-8 h-8 ${color}`} />

                    {/* Content */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-foreground mb-2">{name}</h2>

                        {/* Description */}
                        <ul className="list-disc list-inside space-y-1 mb-4">
                            {description.map((desc, index) => (
                                <li key={index} className="text-muted-foreground">
                                    {desc}
                                </li>
                            ))}
                        </ul>

                        {/* Relations */}
                        {relatedEntities.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Related Entities:</p>
                                <div className="flex flex-wrap gap-2">
                                    {relatedEntities.map((relEntity) => {
                                        if (!relEntity) return null;
                                        const relatedBgColor = tailwindColorMap[relEntity.bgColor] || "#e0e7ff";
                                        return <LabelTag key={relEntity.id} icon={relEntity.icon} name={relEntity.name} backgroundColor={relatedBgColor} color={relEntity.color} link={relEntity.link} />;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}