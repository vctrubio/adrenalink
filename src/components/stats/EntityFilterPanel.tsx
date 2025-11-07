"use client";

import type { EntityStats } from "./StatsBarChart";

type EntityFilterPanelProps = {
    stats: EntityStats[];
    selectedEntities: string[];
    highlightedEntity: string | null;
    onEntityClick: (entityId: string) => void;
    onEntityHover: (entityId: string | null) => void;
    onEntityDoubleClick?: (entityId: string) => void;
    onClearAll: () => void;
};

export function EntityFilterPanel({ stats, selectedEntities, highlightedEntity, onEntityClick, onEntityHover, onEntityDoubleClick, onClearAll }: EntityFilterPanelProps) {
    const isEntitySelected = (entityId: string) => selectedEntities.includes(entityId);
    const hasSelection = selectedEntities.length > 0;

    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Filter Entities</h3>
                {hasSelection && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-muted-foreground hover:text-white transition-colors px-3 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-700"
                    >
                        Clear All ({selectedEntities.length})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isSelected = isEntitySelected(stat.id);
                    const isHighlighted = highlightedEntity === stat.id;

                    return (
                        <button
                            key={stat.id}
                            onClick={() => onEntityClick(stat.id)}
                            onMouseEnter={() => onEntityHover(stat.id)}
                            onMouseLeave={() => onEntityHover(null)}
                            className={`
                relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                ${isSelected ? "ring-2 ring-white bg-slate-800" : "bg-slate-800/50 hover:bg-slate-800"}
                ${isHighlighted ? "scale-105 shadow-lg" : ""}
              `}
                        >
                            {/* Icon */}
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: stat.bgColor + "40",
                                }}
                            >
                                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>

                            {/* Info */}
                            <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-xs font-semibold text-white truncate w-full">{stat.name}</span>
                                <span className="text-xs text-muted-foreground">{stat.count}</span>
                            </div>

                            {/* Selected Badge */}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-[10px]">✓</span>
                                </div>
                            )}

                            {/* Relation Count */}
                            {stat.relations.length > 0 && (
                                <div
                                    className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: stat.color,
                                        color: "white",
                                    }}
                                >
                                    {stat.relations.length}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
