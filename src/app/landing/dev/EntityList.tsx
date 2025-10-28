"use client";

import type { EntityConfig } from "@/config/entities";

type EntityListProps = {
    entities: EntityConfig[];
    selectedEntity: string | null;
    relatedEntities: string[];
    onSelectEntity: (entityId: string) => void;
};

export function EntityList({ entities, selectedEntity, relatedEntities, onSelectEntity }: EntityListProps) {
    return (
        <div className="space-y-2">
            {entities.map((entity) => {
                const Icon = entity.icon;
                const isSelected = selectedEntity === entity.id;
                const isRelated = relatedEntities.includes(entity.id);

                return (
                    <button
                        key={entity.id}
                        onClick={() => onSelectEntity(entity.id)}
                        className={`
                            w-full flex items-center gap-4 p-4 rounded-lg transition-all text-left
                            ${isSelected ? `${entity.bgColor} border-2 ${entity.color} border-current shadow-lg` : "bg-card border-2 border-transparent hover:border-muted-foreground hover:shadow-md"}
                            ${isRelated ? "ring-2 ring-secondary/50" : ""}
                        `}
                    >
                        <div className={`${entity.bgColor} p-3 rounded-full flex-shrink-0 ${isSelected ? "bg-white/30" : ""}`}>
                            <Icon className={`${entity.color} w-5 h-5`} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${entity.color} truncate`}>{entity.name}</h3>
                            <p className="text-xs text-muted-foreground">{entity.relations.length} relations</p>
                        </div>
                        {isRelated && (
                            <div className="flex-shrink-0 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
