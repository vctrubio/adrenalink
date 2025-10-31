"use client";

import Link from "next/link";
import { TABLE_CONFIG } from "@/config/tables";
import LabelTag from "@/src/components/tags/LabelTag";

export type EntityCardProps = {
    entityId: string;
    count?: number;
};

export function EntityCard({ entityId, count }: EntityCardProps) {
    const entity = TABLE_CONFIG.find((e) => e.id === entityId);

    if (!entity) return null;

    const { name, icon: Icon, description, hoverColor, color, link, relations } = entity;

    // Get related entity data
    const relatedEntities = relations.map((relId) => TABLE_CONFIG.find((e) => e.id === relId)).filter(Boolean);

    return (
        <Link href={link} className="flex flex-col items-start w-full cursor-pointer">
            {/* Count outside the card */}
            {count !== undefined && <span className="mb-2 text-sm font-bold text-foreground">Count: {count}</span>}

            {/* Card */}
            <div className="w-full border-4 rounded-lg p-6 transition-all duration-200 shadow-md hover:shadow-lg" style={{ borderColor: hoverColor }}>
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
                                        return <LabelTag key={relEntity.id} icon={relEntity.icon} name={relEntity.name} backgroundColor={relEntity.hoverColor} color={relEntity.color} link={relEntity.link} />;
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