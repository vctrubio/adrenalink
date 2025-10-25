"use client";

import type { SchoolModel } from "@/backend/models/SchoolModel";

interface SchoolSubdomainProps {
    school: SchoolModel;
}

// Schema Details Component
function SchemaDetails({ schema }: { schema: any }) {
    return (
        <div className="bg-black/40 rounded-lg border border-gray-700/50 p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-300 border-b border-gray-700/50 pb-3">School Schema Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(schema).map(([key, value]) => (
                    <div key={key}>
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{key}</label>
                        <p className="text-white text-sm bg-gray-900/50 p-2 rounded border border-gray-700/30 font-mono break-all">{value === null ? "null" : String(value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Relations Data Component
function RelationsData({ relations }: { relations?: any }) {
    if (!relations) return null;

    return (
        <div className="bg-black/40 rounded-lg border border-gray-700/50 p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-300 border-b border-gray-700/50 pb-3">Relations Data</h2>
            <div className="bg-gray-900/50 p-4 rounded border border-gray-700/30">
                <div className="space-y-2">
                    {Object.entries(relations).map(([key, value]) => (
                        <div key={key}>
                            <span className="text-gray-300 font-semibold">{key}:</span>
                            <span className="text-white ml-2">{Array.isArray(value) ? `${value.length} items` : typeof value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SchoolDebugSubdomain({ school }: SchoolSubdomainProps) {
    return (
        <div className="container mx-auto px-6 py-12">
            <SchemaDetails schema={school.schema} />
            <RelationsData relations={school.relations} />
        </div>
    );
}
