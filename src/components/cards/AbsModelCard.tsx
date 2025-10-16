"use client";

import type { SerializedAbstractModel } from "@/backend/models";

export default function AbsModelCard({ model }: { model: SerializedAbstractModel<any> }) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 max-w-4xl shadow-lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground">Model Debug Card</h2>
                    <p className="text-muted-foreground">Table: <span className="font-mono text-foreground">{model.tableName}</span></p>
                </div>

                {/* Schema */}
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Schema</h3>
                    <div className="bg-muted/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="text-foreground whitespace-pre-wrap">
                            {JSON.stringify(model.schema, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Relations */}
                {model.relations && Object.keys(model.relations).length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Relations</h3>
                        <div className="bg-muted/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <pre className="text-foreground whitespace-pre-wrap">
                                {JSON.stringify(model.relations, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Lambda */}
                {model.lambda && Object.keys(model.lambda).length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Lambda (Computed Values)</h3>
                        <div className="bg-muted/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <pre className="text-foreground whitespace-pre-wrap">
                                {JSON.stringify(model.lambda, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Empty States */}
                {(!model.relations || Object.keys(model.relations).length === 0) && (
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground mb-3">Relations</h3>
                        <p className="text-muted-foreground italic">No relations loaded</p>
                    </div>
                )}

                {(!model.lambda || Object.keys(model.lambda).length === 0) && (
                    <div>
                        <h3 className="text-lg font-semibold text-muted-foreground mb-3">Lambda (Computed Values)</h3>
                        <p className="text-muted-foreground italic">No computed values</p>
                    </div>
                )}
            </div>
        </div>
    );
}