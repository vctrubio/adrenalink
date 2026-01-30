"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import KiteIcon from "@/public/appSvgs/Equipments/KiteIcon";
import WingIcon from "@/public/appSvgs/Equipments/WingIcon";
import WindsurfIcon from "@/public/appSvgs/Equipments/WindsurfIcon";

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
                            <tr key={rowIndex} className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
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

function SchoolSection() {
    const headers = ["Name", "Currency", "Country"];
    const rows = [
        ["Fellviana", "EUR", "Spain"],
        ["Tarifa Kite", "EUR", "Spain"],
        ["Windy City", "EUR", "Portugal"],
    ];

    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-5xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-indigo-100 text-indigo-600">
                    <AdminIcon size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Schools</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Manage your institution with precision. Example data structure for school registry.
                    </p>
                </div>
                <DataTable headers={headers} rows={rows} />
            </div>
        </section>
    );
}

function PackagesSection() {
    const headers = [
        "Type", 
        "Name", 
        "Equipment", 
        "Cap. Equip", 
        "Cap. Student", 
        <span key="dur">Duration <span className="font-normal text-slate-400 normal-case">(Minutes)</span></span>, 
        <span key="price">Price <span className="font-normal text-slate-400 normal-case">(Currency)</span></span>
    ];
    
    const rows = [
        ["Lessons", "Kite Beginner", "Kite + Board", 1, 2, 120, 150],
        ["Lessons", "Private Advance", "Full Gear", 1, 1, 60, 90],
        ["Lessons", "Group Lesson", "Kite Only", 2, 4, 180, 200],
    ];

    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-white border-t border-slate-200">
            <div className="max-w-6xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-orange-100 text-orange-600">
                    <PackageIcon size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Packages</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Flexible pricing and lesson bundles. Structure for service offerings.
                    </p>
                </div>
                <DataTable headers={headers} rows={rows} />
            </div>
        </section>
    );
}

function EquipmentsSection() {
    const headers = ["Type", "Brand", "Model", "Size", "Color", "SKU"];
    
    const rows = [
        // Kites
        [
            <div key="k1" className="flex items-center gap-2"><KiteIcon size={20} className="text-purple-600" /> Kite</div>, 
            "North", "Orbit", 9, "Red", "NTH-ORB-09"
        ],
        [
            <div key="k2" className="flex items-center gap-2"><KiteIcon size={20} className="text-purple-600" /> Kite</div>, 
            "Reach", 12, "Green", "NTH-RCH-12"
        ],
        // Wings
        [
            <div key="w1" className="flex items-center gap-2"><WingIcon size={20} className="text-purple-600" /> Wing</div>, 
            "North", "Nova", 4.7, "Blue", "NTH-NOV-47"
        ],
        [
            <div key="w2" className="flex items-center gap-2"><WingIcon size={20} className="text-purple-600" /> Wing</div>, 
            "North", "Mode", 5.3, "Black", "NTH-MOD-53"
        ],
        // Board
        [
            <div key="b1" className="flex items-center gap-2"><WindsurfIcon size={20} className="text-purple-600" /> Board</div>, 
            "North", "Atmos Carbon", 138, "Black", "NTH-ATM-138"
        ],
    ];

    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-6xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-purple-100 text-purple-600">
                    <EquipmentIcon size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Equipments</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Track inventory and assets. Standardized equipment data format.
                    </p>
                </div>
                <DataTable headers={headers} rows={rows} />
            </div>
        </section>
    );
}

// --- Main Page Component ---

export default function CsvPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Animation thresholds (in pixels)
    const SCROLL_THRESHOLD = 150;

    // Logo & Adrenalink (Exit)
    const opacityLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [1, 0]);
    const yLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, -50]);
    const scaleLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [1, 0.8]);

    // Administration (Enter)
    const opacityAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
    const yAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [50, 0]);
    const scaleAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0.8, 1]);

    return (
        <main className="bg-background relative">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="relative w-full max-w-7xl px-8 h-full flex items-center gap-4">
                    
                    {/* Stationary Logo */}
                    <Image
                        src="/ADR.webp"
                        alt="Adrenalink Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                    />

                    {/* Text Container for Transition */}
                    <div className="relative h-10 w-full flex items-center">
                        {/* Text 1: Adrenalink (Exit) */}
                        <motion.span 
                            style={{ opacity: opacityLogo, y: yLogo }}
                            className="absolute left-0 text-3xl font-black tracking-tighter text-foreground origin-left"
                        >
                            Adrenalink
                        </motion.span>

                        {/* Text 2: Administration (Enter) */}
                        <motion.span 
                            style={{ opacity: opacityAdmin, y: yAdmin }}
                            className="absolute left-0 text-3xl font-black tracking-tighter text-secondary origin-left"
                        >
                            Administration
                        </motion.span>
                    </div>

                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-24" />

            {/* Content Sections */}
            <SchoolSection />
            <PackagesSection />
            <EquipmentsSection />
        </main>
    );
}