"use client";

import type { EntityStats } from "./StatsBarChart";

type EntityRelationsViewProps = {
    stats: EntityStats[];
    highlightedEntity: string | null;
};

export function EntityRelationsView({ stats, highlightedEntity }: EntityRelationsViewProps) {
    if (!highlightedEntity) {
        return (
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700 flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground text-sm">Hover over an entity to see its relations</p>
            </div>
        );
    }

    const entity = stats.find((s) => s.id === highlightedEntity);
    if (!entity) return null;

    const Icon = entity.icon;
    const relatedEntities = stats.filter((s) => entity.relations.includes(s.id));

    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="p-3 rounded-xl"
                    style={{
                        backgroundColor: entity.bgColor + "40",
                    }}
                >
                    <Icon className="w-8 h-8" style={{ color: entity.color }} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{entity.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {entity.count} {entity.count === 1 ? "item" : "items"} • {entity.relations.length} relations
                    </p>
                </div>
            </div>

            {/* Relations Grid */}
            {relatedEntities.length > 0 ? (
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Related Entities</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {relatedEntities.map((related) => {
                            const RelatedIcon = related.icon;

                            return (
                                <div
                                    key={related.id}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-secondary transition-all duration-300 group cursor-pointer"
                                >
                                    <div
                                        className="p-2 rounded-lg transition-transform group-hover:scale-110"
                                        style={{
                                            backgroundColor: related.bgColor + "40",
                                        }}
                                    >
                                        <RelatedIcon className="w-6 h-6" style={{ color: related.color }} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-white">{related.name}</p>
                                        <p className="text-xs text-muted-foreground">{related.count}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No relations found</p>
                </div>
            )}
        </div>
    );
}
