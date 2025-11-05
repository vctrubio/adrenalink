"use client";

import { useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { EntityDetails } from "./EntityDetails";
import { DevCard } from "./DevCard";

export function EntityDevPage() {
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

    const selectedData = ENTITY_DATA.find((e) => e.id === selectedEntity);
    const isRelated = (entityId: string) => {
        if (!selectedEntity) return false;
        const selected = ENTITY_DATA.find((e) => e.id === selectedEntity);
        return selected?.relations.includes(entityId);
    };

    const entityPairs = [
        ["school", "schoolPackage"],
        ["teacher", "commission"],
        ["student", "studentPackage"],
        ["booking", "lesson"],
        ["event", "equipment"],
        ["payment", "student_lesson_feedback"],
        ["repairs", "rental"],
        ["userWallet", "referral"],
    ];

    const orderedEntities = entityPairs
        .flat()
        .map((id) => ENTITY_DATA.find((e) => e.id === id))
        .filter(Boolean);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-5xl font-bold text-foreground mb-6">Schools Architecture</h1>
                <p className="text-muted-foreground text-lg">Entity pairs organized by relationship</p>
            </div>

            <div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {orderedEntities.map((entity) => {
                        if (!entity) return null;
                        const isSelected = selectedEntity === entity.id;
                        const isRelatedEntity = isRelated(entity.id);
                        const isHovered = hoveredEntity === entity.id;

                        return (
                            <DevCard
                                key={entity.id}
                                entity={entity}
                                isSelected={isSelected}
                                isHovered={isHovered}
                                isRelated={isRelatedEntity}
                                onClick={() => setSelectedEntity(isSelected ? null : entity.id)}
                                onMouseEnter={() => setHoveredEntity(entity.id)}
                                onMouseLeave={() => setHoveredEntity(null)}
                            />
                        );
                    })}
                </div>

                {selectedData && (
                    <div className="mb-8">
                        <EntityDetails entity={selectedData} onNavigateToEntity={setSelectedEntity} />
                    </div>
                )}
            </div>
        </div>
    );
}
