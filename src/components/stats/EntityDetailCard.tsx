"use client";

import type { EntityStats } from "./StatsBarChart";

type EntityDetailCardProps = {
    entity: EntityStats;
    allStats: EntityStats[];
    onClose: () => void;
};

export function EntityDetailCard({ entity, allStats, onClose }: EntityDetailCardProps) {
    const Icon = entity.icon;
    const relatedEntities = allStats.filter((s) => entity.relations.includes(s.id));
    const totalCount = allStats.reduce((sum, s) => sum + s.count, 0);
    const percentage = ((entity.count / totalCount) * 100).toFixed(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl border-2 max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ borderColor: entity.color }}>
                {/* Header */}
                <div
                    className="p-6 border-b border-slate-700 relative"
                    style={{
                        background: `linear-gradient(135deg, ${entity.bgColor}20, transparent)`,
                    }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-white w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-4 rounded-xl"
                            style={{
                                backgroundColor: entity.bgColor + "40",
                            }}
                        >
                            <Icon className="w-12 h-12" style={{ color: entity.color }} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">{entity.name}</h2>
                            <p className="text-muted-foreground">Entity Details</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Total Count</p>
                            <p className="text-2xl font-bold text-white">{entity.count}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Percentage</p>
                            <p className="text-2xl font-bold text-white">{percentage}%</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Relations</p>
                            <p className="text-2xl font-bold text-white">{entity.relations.length}</p>
                        </div>
                    </div>
                </div>

                {/* Related Entities */}
                <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Related Entities</h3>

                    {relatedEntities.length > 0 ? (
                        <div className="space-y-3">
                            {relatedEntities.map((related) => {
                                const RelatedIcon = related.icon;
                                const relatedPercentage = ((related.count / totalCount) * 100).toFixed(1);

                                return (
                                    <div
                                        key={related.id}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700"
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor: related.bgColor + "40",
                                            }}
                                        >
                                            <RelatedIcon className="w-6 h-6" style={{ color: related.color }} />
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{related.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {related.count} items • {relatedPercentage}% of total
                                            </p>
                                        </div>

                                        {/* Mini bar */}
                                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${relatedPercentage}%`,
                                                    backgroundColor: related.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No related entities</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
