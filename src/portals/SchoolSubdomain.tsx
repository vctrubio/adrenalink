"use client";

import type { SchoolType } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";

interface SchoolSubdomainProps {
    school: SerializedAbstractModel<SchoolType>;
}

export default function SchoolSubdomain({ school }: SchoolSubdomainProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="container mx-auto px-6 py-12">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold mb-4 text-gray-300">Welcome to Hell</h1>
                    <p className="text-xl text-gray-400">{school.schema.name} Administrative Portal</p>
                    <p className="text-lg text-gray-500 mt-2">
                        Subdomain: <span className="text-gray-300 font-mono">{school.schema.username}.localhost:3000</span>
                    </p>
                </div>

                {/* School Schema Details */}
                <div className="bg-black/40 rounded-lg border border-gray-700/50 p-8 mb-8">
                    <h2 className="text-3xl font-bold mb-6 text-gray-300 border-b border-gray-700/50 pb-3">School Schema Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">ID</label>
                                <p className="text-white font-mono text-sm bg-gray-900/50 p-2 rounded border border-gray-700/30">{school.schema.id}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">School Name</label>
                                <p className="text-white text-lg font-semibold">{school.schema.name}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Username</label>
                                <p className="text-gray-300 text-lg font-mono">{school.schema.username}</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Country</label>
                                <p className="text-white text-lg">{school.schema.country}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Phone</label>
                                <p className="text-white text-lg font-mono">{school.schema.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Relations & Lambda Data */}
                {(school.relations || school.lambda) && (
                    <div className="bg-black/40 rounded-lg border border-gray-700/50 p-8">
                        <h2 className="text-3xl font-bold mb-6 text-gray-300 border-b border-gray-700/50 pb-3">Extended Data</h2>

                        {/* Lambda Data */}
                        {school.lambda && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-400 mb-3">Lambda Computed Values</h3>
                                <div className="bg-gray-900/50 p-4 rounded border border-gray-700/30">
                                    <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">{JSON.stringify(school.lambda, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {/* Relations Data */}
                        {school.relations && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-400 mb-3">Relations</h3>
                                <div className="bg-gray-900/50 p-4 rounded border border-gray-700/30">
                                    <div className="space-y-2">
                                        {Object.entries(school.relations).map(([key, value]) => (
                                            <div key={key}>
                                                <span className="text-gray-300 font-semibold">{key}:</span>
                                                <span className="text-white ml-2">{Array.isArray(value) ? `${value.length} items` : typeof value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Portal Actions */}
                <div className="mt-12 text-center">
                    <div className="inline-flex space-x-4">
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">Manage Students</button>
                        <button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-gray-600">View Packages</button>
                        <button className="bg-black hover:bg-gray-900 text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors border border-gray-700">Settings</button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-gray-500">
                    <p className="text-sm">Administrative Portal</p>
                </div>
            </div>
        </div>
    );
}
