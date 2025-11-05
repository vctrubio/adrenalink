"use client";

import type { EntityConfig } from "@/config/entities";
import { ENTITY_DATA } from "@/config/entities";

type EntityDetailsProps = {
    entity: EntityConfig;
    onNavigateToEntity: (entityId: string) => void;
};

export function EntityDetails({ entity, onNavigateToEntity }: EntityDetailsProps) {
    const Icon = entity.icon;
    const relatedEntities = entity.relations
        .map((relId) => ENTITY_DATA.find((e) => e.id === relId))
        .filter((e): e is EntityConfig => e !== undefined);

    return (
        <div className="bg-card border-2 border-border rounded-xl p-8 shadow-2xl h-full overflow-y-auto">
            <div className="flex items-start gap-6 mb-6">
                <div className={`${entity.bgColor} p-6 rounded-2xl flex-shrink-0`}>
                    <Icon className={`${entity.color} w-16 h-16`} size={64} />
                </div>
                <div className="flex-1">
                    <h2 className={`text-3xl font-bold ${entity.color} mb-3`}>{entity.name}</h2>
                    <div className="space-y-2">
                        {entity.description.map((desc, idx) => (
                            <p key={idx} className="text-muted-foreground">{desc}</p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-2xl">Related</span>
                    <span className="text-sm text-muted-foreground">({relatedEntities.length})</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                    {relatedEntities.map((relEntity) => {
                        const RelIcon = relEntity.icon;
                        return (
                            <button
                                key={relEntity.id}
                                onClick={() => onNavigateToEntity(relEntity.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 ${relEntity.bgColor} ${relEntity.color} border-current hover:shadow-lg`}
                            >
                                <RelIcon className="w-4 h-4" size={16} />
                                <span className="font-medium">{relEntity.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-2xl">API</span>
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">GET</span>
                        <span>/api/{entity.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-secondary font-bold">POST</span>
                        <span>/api/{entity.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-fourth font-bold">PATCH</span>
                        <span>/api/{entity.id}/:id</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
