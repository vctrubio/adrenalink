"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
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
                        <tr key={i} className="border-b border-slate-100 last:border-b-0 hover:bg-white/80 transition-colors">
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

function SchoolSection() {
    const headers = ["Name", "Currency", "Country", "Website", "Contact", "Instagram"];
    const rows = [
        ["Feelviana", "EUR", "Portugal", "feelviana.com", "+351 258 000 000", <span key="1"><span className="text-secondary">@</span>feelviana</span>],
        ["Tarifa Kite", "EUR", "Spain", "tarifakite.es", "+34 611 111 111", <span key="2"><span className="text-secondary">@</span>tarifakite</span>],
        ["Windy City", "ZAR", "South Africa", "windycity.sa", "+27 21 000 0000", <span key="3"><span className="text-secondary">@</span>windy_city</span>],
    ];
    
    const indexData = [
        { col: "Name", type: "String", desc: "Legal entity name", allowed: "Max 255 chars" },
        { col: "Currency", type: "Enum", desc: "Operational currency", allowed: "USD, EUR, CHF" },
        { col: "Country", type: "String", desc: "Physical location", allowed: "ISO 3166 Country Name" },
        { col: "Website", type: "String", desc: "Online presence", allowed: "URL format (e.g. school.com)" },
        { col: "Contact", type: "String", desc: "Phone number", allowed: "+[Country Code] [Number]" },
        { col: "Instagram", type: "String", desc: "Social handle", allowed: "@username" },
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
                <IndiceTable data={indexData} />
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
        ["Lessons", "Kite Beginner", "Kite", 1, 2, 120, 150],
        ["Lessons", "Wing Intro", "Wing", 1, 1, 60, 90],
        ["Lessons", "Pro Session", "Kite", 2, 4, 180, 200],
    ];

    const indexData = [
        { col: "Type", type: "Enum", desc: "Service classification", allowed: "lessons, rental" },
        { col: "Name", type: "String", desc: "Public marketing title", allowed: "Max 255 chars" },
        { col: "Equipment", type: "Enum", desc: "Category of gear provided", allowed: "kite, wing, windsurf" },
        { col: "Cap. Equip", type: "Integer", desc: "Required inventory units", allowed: ">= 1" },
        { col: "Cap. Student", type: "Integer", desc: "Max students per session", allowed: ">= 1" },
        { col: "Duration", type: "Integer", desc: "Session length", allowed: "Minutes (e.g. 60, 120)" },
        { col: "Price", type: "Integer", desc: "Cost per student", allowed: "Numeric value (no symbol)" },
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
                <IndiceTable data={indexData} />
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
        [
            <div key="ws1" className="flex items-center gap-2"><WindsurfIcon size={20} className="text-purple-600" /> Windsurf</div>, 
            "North", "Wave", 3.7, "Red", "NTH-WAV-37"
        ],
    ];

    const indexData = [
        { col: "Type", type: "Enum", desc: "Equipment Category", allowed: "kite, wing, windsurf" },
        { col: "Brand", type: "String", desc: "Manufacturer", allowed: "Max 100 chars" },
        { col: "Model", type: "String", desc: "Product line", allowed: "Max 255 chars" },
        { col: "Size", type: "Float", desc: "Dimensions", allowed: "Meters (Kites/Wings) or CM (Boards)" },
        { col: "Color", type: "String", desc: "Visual identifier", allowed: "Max 100 chars" },
        { col: "SKU", type: "String", desc: "Stock Keeping Unit", allowed: "Unique Identifier" },
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
                <IndiceTable data={indexData} />
            </div>
        </section>
    );
}

function StudentSection() {
    const headers = ["First Name", "Last Name", "Email", "Country", "Phone"];
    const rows = [
        ["John", "Doe", "john.doe@example.com", "Germany", "+49 123 456 7890"],
        ["Alice", "Smith", "alice.smith@example.com", "UK", "+44 20 1234 5678"],
    ];
    
    const indexData = [
        { col: "First Name", type: "String", desc: "Student given name", allowed: "Max 255 chars" },
        { col: "Last Name", type: "String", desc: "Student family name", allowed: "Max 255 chars" },
        { col: "Email", type: "String", desc: "Links to User Account", allowed: "Valid Email Address" },
        { col: "Country", type: "String", desc: "Nationality/Residence", allowed: "ISO 3166 Country Name" },
        { col: "Phone", type: "String", desc: "Contact number", allowed: "+[Country Code] [Number]" },
    ];

    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-white border-t border-slate-200">
            <div className="max-w-5xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-yellow-100 text-yellow-600">
                    <HelmetIcon size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Students</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Client database management. Links to global user accounts via email.
                    </p>
                </div>
                <DataTable headers={headers} rows={rows} />
                <IndiceTable data={indexData} />
            </div>
        </section>
    );
}

function TeacherSection() {
    const headers = ["First Name", "Last Name", "Username", "Email", "Country"];
    const rows = [
        ["Max", "Mustermann", "max_teach", "max@instructor.com", "Austria"],
        ["Sarah", "Connor", "sarah_c", "sarah@instructor.com", "USA"],
    ];
    
    const indexData = [
        { col: "First Name", type: "String", desc: "Teacher given name", allowed: "Max 255 chars" },
        { col: "Last Name", type: "String", desc: "Teacher family name", allowed: "Max 255 chars" },
        { col: "Username", type: "String", desc: "System handle", allowed: "Unique identifier" },
        { col: "Email", type: "String", desc: "Links to User Account", allowed: "Valid Email Address" },
        { col: "Country", type: "String", desc: "Nationality/Residence", allowed: "ISO 3166 Country Name" },
    ];

    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-5xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-green-100 text-green-600">
                    <HeadsetIcon size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Teachers</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Instructor profiles and credentials. Links to global user accounts.
                    </p>
                </div>
                <DataTable headers={headers} rows={rows} />
                <IndiceTable data={indexData} />
            </div>
        </section>
    );
}

// --- Main Page Component ---

export default function CsvPage() {
    const { scrollY } = useScroll();

    // Animation thresholds (in pixels)
    const SCROLL_THRESHOLD = 150;

    // Logo & Adrenalink (Exit)
    const opacityLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [1, 0]);
    const yLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, -50]);

    // Administration (Enter)
    const opacityAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
    const yAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [50, 0]);

    const SETTING_UP = (
        <>
            <SchoolSection />
            <PackagesSection />
            <EquipmentsSection />
        </>
    );

    const USERS = (
        <>
            <StudentSection />
            <TeacherSection />
        </>
    );

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

            {/* Setting Up Group */}
            <div className="flex flex-col">
                <div className="bg-slate-100 py-12 text-center border-b border-slate-200">
                    <h3 className="text-xl font-mono font-bold tracking-[0.5em] text-slate-400 uppercase">Step 1: Setting Up</h3>
                </div>
                {SETTING_UP}
            </div>

            {/* Users Group */}
            <div className="flex flex-col">
                <div className="bg-slate-100 py-12 text-center border-y border-slate-200">
                    <h3 className="text-xl font-mono font-bold tracking-[0.5em] text-slate-400 uppercase">Step 2: Users</h3>
                </div>
                {USERS}
            </div>
        </main>
    );
}