"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { CSV_DATA } from "../data";
import { CsvImporter } from "../CsvImporter";
import { motion, AnimatePresence } from "framer-motion";

export default function ImportPage() {
    const [activeImport, setActiveImport] = useState<keyof typeof CSV_DATA | null>(null);

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            {/* Minimal Header */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-[1600px] mx-auto px-8 h-full flex items-center justify-between">
                    <Link href="/csv" className="flex items-center gap-4 group">
                        <div className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <ArrowLeft size={20} className="text-slate-400 group-hover:text-slate-900" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Image src="/ADR.webp" alt="Logo" width={32} height={32} />
                            <span className="font-black uppercase tracking-tighter text-slate-900 text-lg">Import Center</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                            v1.0.4-Beta
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-32 pb-40 px-8 max-w-[1400px] mx-auto space-y-12">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Data System</h1>
                    <p className="text-slate-500 font-medium">Select a module to define your registry. Empty tables indicate required headers.</p>
                </div>

                <div className="space-y-8">
                    {(Object.keys(CSV_DATA) as Array<keyof typeof CSV_DATA>).map((key) => {
                        const data = CSV_DATA[key];
                        const Icon = data.icon;
                        const isActive = activeImport === key;
                        
                        return (
                            <div 
                                key={key}
                                className={`bg-white border rounded-[2rem] overflow-hidden transition-all ${
                                    isActive ? "border-secondary ring-4 ring-secondary/5 shadow-2xl" : "border-slate-200 shadow-sm hover:border-slate-300"
                                }`}
                            >
                                {/* Header / Row */}
                                <div className="p-8 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${data.colorClass} ${data.iconColorClass}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{data.title}</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{data.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => {/* Download Template */}}
                                            className="px-6 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all"
                                        >
                                            Download .CSV
                                        </button>
                                        <button 
                                            onClick={() => setActiveImport(isActive ? null : key)}
                                            className={`px-8 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                                                isActive ? "bg-slate-900 text-white" : "bg-secondary text-white shadow-lg shadow-secondary/20 hover:scale-105"
                                            }`}
                                        >
                                            {isActive ? "Close Module" : "Open Importer"}
                                        </button>
                                    </div>
                                </div>

                                {/* Preview / Importer Area */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100 bg-[#FBFDFF]"
                                        >
                                            <div className="p-8">
                                                <CsvImporter 
                                                    entityType={key as any} 
                                                    onImportComplete={(data) => {
                                                        console.log(`Imported ${key}:`, data);
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}