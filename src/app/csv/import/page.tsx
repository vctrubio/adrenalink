"use client";

import React, { useState } from "react";
import { CsvImporter } from "../CsvImporter";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Database } from "lucide-react";

export default function ImportPage() {
    const [selectedType, setSelectedType] = useState<"school" | "packages" | null>(null);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Minimal Header */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
                    <Link href="/csv" className="flex items-center gap-4 group">
                        <div className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <ArrowLeft size={20} className="text-slate-400 group-hover:text-slate-900" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Image src="/ADR.webp" alt="Logo" width={32} height={32} />
                            <span className="font-black uppercase tracking-tighter text-slate-900">Import Center</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setSelectedType("school")}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                selectedType === "school" ? "bg-secondary text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Schools
                        </button>
                        <button 
                            onClick={() => setSelectedType("packages")}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                selectedType === "packages" ? "bg-secondary text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Packages
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-32 px-8">
                {!selectedType ? (
                    <div className="max-w-4xl mx-auto text-center space-y-12 py-20">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tight">What are we importing?</h1>
                            <p className="text-xl text-slate-500 font-medium">Select a category to start your data migration process.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <button 
                                onClick={() => setSelectedType("school")}
                                className="p-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-secondary transition-all group text-left space-y-6"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LayoutDashboard size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Schools</h3>
                                    <p className="text-slate-500 font-medium">Institution registry, contact info, and locales.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setSelectedType("packages")}
                                className="p-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-secondary transition-all group text-left space-y-6"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Database size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Packages</h3>
                                    <p className="text-slate-500 font-medium">Lesson types, equipment bundles, and pricing.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <CsvImporter 
                        entityType={selectedType} 
                        onImportComplete={(data) => {
                            console.log("Imported Data:", data);
                            // In a real app, we'd send this to Supabase
                        }}
                    />
                )}
            </div>
        </main>
    );
}
