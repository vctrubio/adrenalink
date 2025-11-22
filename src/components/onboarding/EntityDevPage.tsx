"use client";

import { useState, useEffect } from "react";
import { RAINBOW_ENTITIES, RAINBOW_COLORS } from "@/config/rainbow-entities";
import { RainbowIdentityCardTable } from "@/src/components/rainbow/RainbowIdentityCard";
import type { EntityConfig } from "@/types/rainbow-types";

const ENTITY_ORDER = ["school", "rental", "studentPackage", "schoolPackage", "student", "teacher", "commission", "lesson", "booking", "event", "equipment", "repairs"];

function EntityFrontCard({ entity }: { entity: EntityConfig }) {
    const shade = RAINBOW_COLORS[entity.shadeId];
    const Icon = entity.icon;

    return (
        <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-shrink-0 m-4 flex gap-3 items-start">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 " style={{ color: shade.fill }}>
                    <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: shade.fill }}>
                    {entity.name}
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                <RainbowIdentityCardTable entity={entity} />
            </div>
        </div>
    );
}

function EntityBackCard({ entity }: { entity: EntityConfig }) {
    const Description = entity.description;

    return (
        <div className="h-full flex items-center justify-center overflow-y-auto p-4">
            <div className="text-white/90 text-sm space-y-3 text-center">
                <Description />
            </div>
        </div>
    );
}

function EntityCard({ entity, isSelected, isRelated }: { entity: EntityConfig; isSelected: boolean; isRelated: boolean }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const shade = RAINBOW_COLORS[entity.shadeId];
    const isEntityRelatedAndSelected = isSelected && isRelated;

    useEffect(() => {
        if (!isSelected) {
            setIsFlipped(false);
        }
    }, [isSelected]);

    return (
        <div
            className="rounded-2xl border-2 overflow-hidden shadow-lg flex flex-col transition-opacity cursor-pointer min-h-64"
            style={{
                borderColor: shade.fill,
                boxShadow: `0 10px 40px ${shade.fill}40`,
                opacity: isRelated || !isSelected ? 1 : 0.5,
            }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                className="h-2"
                style={{
                    background: isEntityRelatedAndSelected ? shade.fill : `linear-gradient(90deg, ${shade.fill}, ${shade.hoverFill})`,
                }}
            />
            <div className="p-4 bg-black/60 flex-1 flex flex-col overflow-hidden relative">
                <div className={`absolute inset-0 flex flex-col overflow-hidden transition-opacity duration-500 ${isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <EntityFrontCard entity={entity} />
                </div>
                <div className={`absolute inset-0 flex flex-col overflow-hidden transition-opacity duration-500 ${isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <EntityBackCard entity={entity} />
                </div>
            </div>
        </div>
    );
}

export function EntityDevPage() {
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

    const isRelated = (entityId: string) => {
        if (!selectedEntity) return false;
        const selected = RAINBOW_ENTITIES.find((e) => e.id === selectedEntity);
        return selected?.relations?.includes(entityId) ?? false;
    };

    const orderedEntities = ENTITY_ORDER.map((id) => RAINBOW_ENTITIES.find((e) => e.id === id)).filter(Boolean);

    return (
        <div className="h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-5xl font-bold text-foreground mb-6">Schools Architecture</h1>
                <p className="text-muted-foreground text-lg">Click any card to see related entities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
                {orderedEntities.map((entity) => {
                    if (!entity) return null;
                    const isEntitySelected = selectedEntity === entity.id;
                    const isEntityRelated = isRelated(entity.id);

                    return (
                        <div key={entity.id} onClick={() => setSelectedEntity(isEntitySelected ? null : entity.id)} className="text-left transition-all hover:scale-105">
                            <EntityCard entity={entity} isSelected={selectedEntity !== null} isRelated={isEntityRelated || isEntitySelected} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
