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

    const [rawData, setRawData] = useState<any[]>([]);

    const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);



    // --- Simple CSV Parser ---

    const parseCSV = (text: string) => {

        const lines = text.split(/\r?\n/).filter(line => line.trim());

        if (lines.length < 1) return [];



        const headers = lines[0].split(",").map(h => h.trim());

        return lines.slice(1).map(line => {

            const values = line.split(",").map(v => v.trim());

            const obj: any = {};

            headers.forEach((header, i) => {

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



    const downloadTemplate = () => {

        const headers = schema.columns.map(c => c.label).join(",");

        const exampleRow = schema.columns.map(c => {

            if (c.type === "enum") return c.allowedValues?.[0];

            if (c.type === "number") return "1";

            return "Example";

        }).join(",");

        

        const csvContent = `${headers}\n${exampleRow}`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement("a");

        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);

        link.setAttribute("download", `${entityType}_template.csv`);

        link.style.visibility = 'hidden';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    };



    const handleSubmit = () => {

        if (rawData.length === 0) {

            toast.error("No data to import");

            return;

        }

        if (Object.keys(errors).length > 0) {

            toast.error("Please fix errors before submitting");

            return;

        }

        onImportComplete(rawData);

        toast.success("Data processed successfully!");

    };



    return (

        <div className="w-full flex flex-col gap-6">

            {/* Action Bar */}

            <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">

                <div className="flex items-center gap-4">

                    <button 

                        onClick={() => fileInputRef.current?.click()}

                        className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-secondary/20 hover:scale-105 transition-all active:scale-95"

                    >

                        <Upload size={14} /> Import File

                    </button>

                    <button 

                        onClick={downloadTemplate}

                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all"

                    >

                        <Download size={14} /> Template

                    </button>

                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

                </div>



                <div className="flex items-center gap-6">

                    {rawData.length > 0 && (

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">

                            <FileText size={12} /> {rawData.length} Rows Detected

                        </div>

                    )}

                    {Object.keys(errors).length > 0 && (

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest">

                            <AlertCircle size={12} /> {Object.keys(errors).length} Errors

                        </div>

                    )}

                    <button 

                        onClick={handleSubmit}

                        disabled={rawData.length === 0}

                        className={`flex items-center gap-2 px-8 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all ${

                            rawData.length > 0 ? "bg-slate-900 text-white shadow-xl hover:bg-black" : "bg-slate-100 text-slate-300 cursor-not-allowed"

                        }`}

                    >

                        Confirm & Process

                    </button>

                </div>

            </div>



            {/* Data Grid */}

            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[500px] flex flex-col">

                <div className="overflow-x-auto flex-1">

                    <table className="w-full text-xs text-left font-mono border-collapse">

                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">

                            <tr>

                                <th className="px-6 py-5 w-16 text-center text-slate-400 font-black">#</th>

                                {schema.columns.map(col => (

                                    <th key={col.dbField} className="px-6 py-5 font-black uppercase tracking-[0.1em] text-slate-500 whitespace-nowrap">

                                        <div className="flex items-center gap-2">

                                            {col.label}

                                            {col.required && <span className="text-red-400">*</span>}

                                        </div>

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            {rawData.length === 0 ? (

                                <tr>

                                    <td colSpan={schema.columns.length + 1} className="py-32">

                                        <div className="flex flex-col items-center justify-center text-center gap-4 opacity-30">

                                            <div className="p-8 rounded-full border-4 border-dashed border-slate-200">

                                                <Upload size={48} />

                                            </div>

                                            <div className="space-y-1">

                                                <p className="text-lg font-black uppercase tracking-widest">Ready for Data</p>

                                                <p className="text-xs font-medium">Upload a CSV or XLSM file to begin.</p>

                                            </div>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                rawData.map((row, rowIndex) => (

                                    <tr key={rowIndex} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group">

                                        <td className="px-6 py-3 text-center text-slate-300 font-bold">{rowIndex + 1}</td>

                                        {schema.columns.map(col => {

                                            const error = errors[rowIndex]?.[col.dbField];

                                            return (

                                                <td key={col.dbField} className="px-2 py-2">

                                                    <div className="relative">

                                                        <input 

                                                            type="text"

                                                            value={row[col.dbField] || ""}

                                                            placeholder={`Enter ${col.label.toLowerCase()}...`}

                                                            onChange={(e) => handleCellChange(rowIndex, col.dbField, e.target.value)}

                                                            className={`w-full px-4 py-2.5 bg-transparent rounded-xl border-2 transition-all outline-none font-medium ${

                                                                error 

                                                                    ? "border-red-500 bg-red-50 text-red-900" 

                                                                    : "border-transparent focus:border-secondary focus:bg-white hover:bg-slate-100/50"

                                                            }`}

                                                        />

                                                        {error && (

                                                            <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full shadow-lg z-20 group-hover:scale-110 transition-transform cursor-help" title={error}>

                                                                <AlertCircle size={10} />

                                                            </div>

                                                        )}

                                                    </div>

                                                </td>

                                            );

                                        })}

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}
