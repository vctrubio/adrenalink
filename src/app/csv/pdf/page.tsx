"use client";

import React from "react";
import { CSV_DATA } from "../data";
import { PdfHeader, FindOutMoreFooter } from "@/src/components/onboarding/pdf/PdfHeader";

// --- PDF Components ---

function PdfTable({ headers, rows }: { headers: (string | React.ReactNode)[]; rows: (string | number | React.ReactNode)[][] }) {
    return (
        <div className="w-full border border-black/20 bg-white mb-6">
            <table className="w-full text-xs text-left text-slate-600">
                <thead className="text-[10px] text-slate-800 uppercase bg-slate-50 border-b border-black/20">
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i} className="px-4 py-2 font-bold tracking-wider border-r border-black/10 last:border-r-0">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-black/10 last:border-b-0">
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-4 py-3 font-medium border-r border-black/10 last:border-r-0 whitespace-nowrap"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PdfSection({ data }: { data: typeof CSV_DATA.school }) {
    const Icon = data.icon;
    const singleRow = data.rows.slice(0, 1);

    return (
        <div className="mb-6 break-inside-avoid">
            <div className="flex items-center gap-4 mb-2 pb-2">
                <div className={`p-2 rounded-full ${data.colorClass} ${data.iconColorClass}`}>
                    <Icon size={32} className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">{data.title}</h2>
                    <p className="text-sm text-slate-500 max-w-2xl font-mono">{data.description}</p>
                </div>
            </div>

            <PdfTable headers={data.headers} rows={singleRow} />

            {/* Simplified Index for PDF - 2 Columns (Column-first flow) */}
            <div className="flex gap-8 text-[9px] font-mono text-slate-400 mt-4 px-2">
                {[
                    data.indexData.slice(0, Math.ceil(data.indexData.length / 2)),
                    data.indexData.slice(Math.ceil(data.indexData.length / 2))
                ].map((column, colIdx) => (
                    <div key={colIdx} className="flex-1 flex flex-col gap-y-1">
                        {column.map((item) => (
                            <div key={item.col} className="flex gap-2 border-b border-dashed border-black/5 pb-0.5">
                                <span className="font-bold text-slate-600 min-w-[80px]">{item.col}:</span>
                                <span>
                                    {item.type === "Enum" ? (
                                        <>
                                            <span className="text-slate-500 font-bold">[{item.allowed}]</span>
                                            <span className="mx-1">//</span>
                                            {item.desc}
                                        </>
                                    ) : (
                                        <>
                                            {item.type} <span className="mx-1">//</span> {item.desc}
                                        </>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PdfCsvPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center print:bg-white print:p-0 print:m-0">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page {
                        size: A3;
                        margin: 0;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    * {
                        box-shadow: none !important;
                        text-shadow: none !important;
                        transition: none !important;
                        animation: none !important;
                    }
                }
            `,
                }}
            />

            <div
                className="w-[297mm] min-h-[420mm] bg-white shadow-2xl relative border border-gray-200 print:shadow-none print:border-none print:w-full print:h-auto flex flex-col"
                style={{ contentVisibility: "auto" }}
            >
                <PdfHeader subtitle="Administration Guide" />

                <div className="px-[10mm] flex-1">
                    {/* Setting Up Group */}
                    <div className="">
                        <h3 className="text-xs font-mono font-bold tracking-[0.5em] text-slate-400 uppercase mb-4 border-b border-black/20">
                            Step 1: Setting Up
                        </h3>
                        <PdfSection data={CSV_DATA.school} />
                        <PdfSection data={CSV_DATA.packages} />
                        <PdfSection data={CSV_DATA.equipments} />
                    </div>

                    {/* Users Group */}
                    <div>
                        <h3 className="text-xs font-mono font-bold tracking-[0.5em] text-slate-400 uppercase mb-4 border-b border-black/20">
                            Step 2: Users
                        </h3>
                        <PdfSection data={CSV_DATA.students} />
                        <PdfSection data={CSV_DATA.teachers} />
                    </div>
                </div>

                <FindOutMoreFooter path="/csv" />
            </div>
        </div>
    );
}
