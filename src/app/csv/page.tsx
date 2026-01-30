"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { CSV_DATA } from "./data";

import { Questionnaire } from "./Questionnaire";

import { useState, useEffect } from "react";

import Link from "next/link";
import { FileText } from "lucide-react";

// --- Header Nav Component ---

function HeaderNav() {
    const [activeGroup, setActiveSection] = useState<string>("setting-up");

    useEffect(() => {
        const handleScroll = () => {
            // Group mappings
            const groups = {
                "setting-up": ["schools", "packages", "equipments"],
                users: ["students", "teachers"],
                questionnaire: ["questionnaire"],
            };

            for (const [group, ids] of Object.entries(groups)) {
                for (const id of ids) {
                    const el = document.getElementById(id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        // Check if section is roughly in the middle of viewport or top part
                        if (rect.top <= 300 && rect.bottom >= 300) {
                            setActiveSection(group);
                            return;
                        }
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToId = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const getLinkClass = (group: string) =>
        `text-sm font-bold uppercase tracking-widest transition-colors ${activeGroup === group ? "text-foreground underline decoration-2 underline-offset-4" : "text-slate-400 hover:text-slate-600"}`;

    return (
        <nav className="flex items-center gap-8 ml-8">
            <button onClick={() => scrollToId("schools")} className={getLinkClass("setting-up")}>
                Setting Up
            </button>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <button onClick={() => scrollToId("students")} className={getLinkClass("users")}>
                Users
            </button>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <button onClick={() => scrollToId("questionnaire")} className={getLinkClass("questionnaire")}>
                Questionnaire
            </button>
        </nav>
    );
}

// --- Data Table Component ---

function DataTable({ headers, rows }: { headers: (string | React.ReactNode)[]; rows: (string | number | React.ReactNode)[][] }) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white mt-8">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            {headers.map((header, i) => (
                                <th key={i} className="px-6 py-3 font-bold tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                            >
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Indice Table Component ---

function DataTypeLegend() {
    return (
        <div className="w-full mt-8 px-8 py-6 bg-slate-100 rounded-[2rem] border border-slate-200 text-center flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase tracking-[0.5em] text-slate-400 opacity-50">Data Types</h3>
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-0">
                <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">String</span>
                    <p className="text-sm text-slate-600 font-medium font-mono px-4">Alphanumeric text, names, and letters.</p>
                </div>
                <div className="hidden md:block w-px h-12 bg-slate-200" />
                <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Integer / Float</span>
                    <p className="text-sm text-slate-600 font-medium font-mono px-4">Numbers (e.g., 4) or Decimals (e.g., 4.5).</p>
                </div>
                <div className="hidden md:block w-px h-12 bg-slate-200" />
                <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Enum</span>
                    <p className="text-sm text-slate-600 font-medium font-mono px-4">Predefined fixed values from a list.</p>
                </div>
            </div>
        </div>
    );
}

function IndiceTable({ data }: { data: { col: string; type: string; desc: string; allowed: string }[] }) {
    return (
        <div className="w-full mt-12 border-t border-slate-200 bg-transparent overflow-hidden">
            <table className="w-full border-collapse font-mono text-[10px]">
                <thead>
                    <tr className="text-slate-400">
                        <th className="px-3 py-4 text-center uppercase tracking-widest font-medium w-[15%]">Col. Name</th>
                        <th className="px-3 py-4 text-center uppercase tracking-widest font-medium w-[10%]">Data Type</th>
                        <th className="px-3 py-4 text-center uppercase tracking-widest font-medium w-[40%]">Description</th>
                        <th className="px-3 py-4 text-center uppercase tracking-widest font-medium w-[35%]">Allowed / Format</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-3 py-3 text-center font-black text-secondary uppercase">{row.col}</td>
                            <td className="px-3 py-3 text-center text-slate-500 font-bold italic uppercase">{row.type}</td>
                            <td className="px-3 py-3 text-center text-slate-500 font-bold">{row.desc}</td>
                            <td className="px-3 py-3 text-center text-slate-500 font-bold italic break-words">{row.allowed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Generic Section Component ---

function CsvSection({ id, data, bgColor = "bg-slate-50" }: { id: string; data: typeof CSV_DATA.school; bgColor?: string }) {
    const Icon = data.icon;
    return (
        <section
            id={id}
            className={`min-h-screen flex flex-col items-center justify-center p-8 border-t border-slate-200 scroll-mt-24 ${bgColor}`}
        >
            <div className="max-w-6xl w-full flex flex-col items-center text-center gap-8">
                <div className={`p-8 rounded-full ${data.colorClass} ${data.iconColorClass}`}>
                    <Icon size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">{data.title}</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">{data.description}</p>
                </div>
                <DataTable headers={data.headers} rows={data.rows} />
                <IndiceTable data={data.indexData} />
                {id === "schools" && <DataTypeLegend />}
            </div>
        </section>
    );
}

// --- Main Page Component ---

export default function CsvPage() {
    return (
        <main className="bg-background relative">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="relative w-full max-w-7xl px-8 h-full flex items-center justify-between">
                    {/* Left: Logo & Nav */}
                    <div className="flex items-center gap-4">
                        <Image src="/ADR.webp" alt="Adrenalink Logo" width={48} height={48} className="object-contain" priority />
                        <HeaderNav />
                    </div>

                    {/* Right: Title (Static) */}
                    <Link href="/csv/pdf" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                        <FileText size={18} className="text-secondary opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xl font-black tracking-tighter text-foreground/20 group-hover:text-foreground/40 transition-colors hidden md:block">
                            PDF
                        </span>
                    </Link>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-24" />

            {/* Content Sections */}
            <div className="flex flex-col">
                <CsvSection id="schools" data={CSV_DATA.school} bgColor="bg-slate-50" />
                <CsvSection id="packages" data={CSV_DATA.packages} bgColor="bg-white" />
                <CsvSection id="equipments" data={CSV_DATA.equipments} bgColor="bg-slate-50" />
                <CsvSection id="students" data={CSV_DATA.students} bgColor="bg-white" />
                <CsvSection id="teachers" data={CSV_DATA.teachers} bgColor="bg-slate-50" />
                <Questionnaire />
            </div>
        </main>
    );
}
