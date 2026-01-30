"use client";

import React, { useState, useRef } from "react";
import { ENTITY_SCHEMAS, EntitySchema } from "./schema";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, Check, AlertCircle, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface CsvImporterProps {
    entityType: "school" | "packages";
    onImportComplete: (data: any[]) => void;
}

export function CsvImporter({ entityType, onImportComplete }: CsvImporterProps) {
    const schema = ENTITY_SCHEMAS[entityType];
    const [step, setStep] = useState<"upload" | "preview">("upload");
    const [rawData, setRawData] = useState<any[]>([]);
    const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Simple CSV Parser ---
    const parseCSV = (text: string) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(",").map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, i) => {
                // Map user-facing label to DB field if possible
                const col = schema.columns.find(c => c.label.toLowerCase() === header.toLowerCase());
                if (col) {
                    obj[col.dbField] = values[i];
                } else {
                    obj[header] = values[i];
                }
            });
            return obj;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = parseCSV(text);
        if (data.length === 0) {
            toast.error("File seems empty or invalid");
            return;
        }

        setRawData(data);
        validateAll(data);
        setStep("preview");
    };

    const validateAll = (data: any[]) => {
        const newErrors: Record<number, Record<string, string>> = {};
        data.forEach((row, index) => {
            const res = schema.zodSchema.safeParse(row);
            if (!res.success) {
                const rowErrors: Record<string, string> = {};
                res.error.errors.forEach(err => {
                    const path = err.path[0] as string;
                    rowErrors[path] = err.message;
                });
                newErrors[index] = rowErrors;
            }
        });
        setErrors(newErrors);
    };

    const handleCellChange = (rowIndex: number, field: string, value: any) => {
        const newData = [...rawData];
        newData[rowIndex] = { ...newData[rowIndex], [field]: value };
        setRawData(newData);
        validateAll(newData);
    };

    const downloadExample = () => {
        const headers = schema.columns.map(c => c.label).join(",");
        const exampleRow = schema.columns.map(c => {
            if (c.type === "enum") return c.allowedValues?.[0];
            if (c.type === "number") return "1";
            return "Example";
        }).join(",");
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${entityType}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = () => {
        if (Object.keys(errors).length > 0) {
            toast.error("Please fix errors before submitting");
            return;
        }
        onImportComplete(rawData);
        toast.success("Data imported successfully!");
        setStep("upload");
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-12">
            <AnimatePresence mode="wait">
                {step === "upload" ? (
                    <motion.div 
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Import {schema.title}</h2>
                            <p className="text-slate-500 font-medium">Upload a CSV or Excel file to populate your registry.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="h-64 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-secondary hover:bg-secondary/5 transition-all group"
                            >
                                <div className="p-6 rounded-full bg-slate-100 group-hover:bg-secondary/10 text-slate-400 group-hover:text-secondary transition-colors">
                                    <Upload size={48} />
                                </div>
                                <span className="text-xl font-black text-slate-400 group-hover:text-secondary uppercase tracking-widest">Select File</span>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".csv" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </button>

                            <button 
                                onClick={downloadExample}
                                className="h-64 border-4 border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-slate-50 transition-all group bg-slate-50/50"
                            >
                                <div className="p-6 rounded-full bg-white group-hover:bg-white text-slate-400 group-hover:text-slate-600 transition-colors shadow-sm">
                                    <Download size={48} />
                                </div>
                                <span className="text-xl font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">Download Template</span>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep("upload")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase text-xs tracking-widest">
                                <X size={16} /> Cancel
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Review Data</h2>
                            <button 
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-8 py-3 bg-secondary text-white rounded-full font-black uppercase text-sm tracking-widest shadow-xl hover:scale-105 transition-all"
                            >
                                Process & Add <ArrowRight size={18} />
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left font-mono">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center text-slate-400">#</th>
                                            {schema.columns.map(col => (
                                                <th key={col.dbField} className="px-6 py-4 font-black uppercase tracking-wider text-slate-500">
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
                                                <td className="px-6 py-4 text-center text-slate-300">{rowIndex + 1}</td>
                                                {schema.columns.map(col => {
                                                    const error = errors[rowIndex]?.[col.dbField];
                                                    return (
                                                        <td key={col.dbField} className="px-2 py-2">
                                                            <div className="relative">
                                                                <input 
                                                                    type="text"
                                                                    value={row[col.dbField] || ""}
                                                                    onChange={(e) => handleCellChange(rowIndex, col.dbField, e.target.value)}
                                                                    className={`w-full px-4 py-2 bg-transparent rounded-xl border-2 transition-all outline-none ${error 
                                                                        ? "border-red-500 bg-red-50 text-red-900"
                                                                        : "border-transparent focus:border-secondary hover:bg-slate-50" 
                                                                    }`}
                                                                />
                                                                {error && (
                                                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md group">
                                                                        <AlertCircle size={12} />
                                                                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                                                                            {error}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
