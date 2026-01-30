"use client";

import { useState } from "react";
import { getCompactNumber } from "@/getters/integer-getter";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import KiteIcon from "@/public/appSvgs/Equipments/KiteIcon";
import { Wind, MessageSquare } from "lucide-react";

export function Questionnaire() {
    const [students, setStudents] = useState<string | null>(null);
    const [teachers, setTeachers] = useState<string | null>(null);
    const [season, setSeason] = useState<string | null>(null);
    const [exportFormat, setExportFormat] = useState<string | null>(null);

    return (
        <section
            id="questionnaire"
            className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-100 border-t border-slate-200 scroll-mt-24"
        >
            <div className="max-w-6xl w-full flex flex-col items-center text-center gap-12">
                {/* Section Header */}
                <div className="p-8 rounded-full bg-slate-200 text-slate-600">
                    <MessageSquare size={80} className="w-20 h-20" />
                </div>
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Tell Us More</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Help us understand your current numbers, so we can help you set up.
                    </p>
                </div>

                                                {/* Questionnaire Content - Centered & Clean */}

                                                <div className="flex flex-col w-full max-w-4xl mt-12 gap-16">

                                                    {/* Students Question */}

                                                    <div className="space-y-8 text-center">

                                                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">How many students do you have annually?</h3>

                                                        <div className="flex justify-center mx-auto items-center gap-6">

                                                            <div className="p-4 rounded-2xl bg-yellow-100 text-yellow-600">

                                                                <HelmetIcon size={40} className="w-10 h-10" />

                                                            </div>

                                                            <div className="flex flex-wrap justify-center gap-4">

                                                                {[

                                                                    { label: `< ${getCompactNumber(5000)}`, value: "<5k" },

                                                                    { label: `${getCompactNumber(5000)} - ${getCompactNumber(10000)}`, value: "5k-10k" },

                                                                    { label: `${getCompactNumber(10000)}+`, value: "10k+" }

                                                                ].map((opt) => (

                                                                    <button

                                                                        key={opt.value}

                                                                        onClick={() => setStudents(opt.value)}

                                                                        className={`px-10 py-3 rounded-2xl text-base font-black transition-all border ${

                                                                            students === opt.value

                                                                                ? "bg-indigo-600 text-white border-transparent shadow-lg scale-105"

                                                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"

                                                                        }`}

                                                                    >

                                                                        {opt.label}

                                                                    </button>

                                                                ))}

                                                            </div>

                                                        </div>

                                                    </div>

                                

                                                    <div className="h-0.5 bg-zinc-800/10 w-full max-w-md mx-auto" />

                                

                                                    {/* Teachers Question */}

                                                    <div className="space-y-8 text-center">

                                                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">How many teachers are on your team?</h3>

                                                        <div className="flex justify-center mx-auto items-center gap-6">

                                                            <div className="p-4 rounded-2xl bg-green-100 text-green-600">

                                                                <HeadsetIcon size={40} className="w-10 h-10" />

                                                            </div>

                                                            <div className="flex flex-wrap justify-center gap-4">

                                                                {[

                                                                    { label: "< 3 Teachers", value: "<3" },

                                                                    { label: "< 10 Teachers", value: "<10" },

                                                                    { label: "10+ Teachers", value: "10+" }

                                                                ].map((opt) => (

                                                                    <button

                                                                        key={opt.value}

                                                                        onClick={() => setTeachers(opt.value)}

                                                                        className={`px-10 py-3 rounded-2xl text-base font-black transition-all border ${

                                                                            teachers === opt.value

                                                                                ? "bg-indigo-600 text-white border-transparent shadow-lg scale-105"

                                                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"

                                                                        }`}

                                                                    >

                                                                        {opt.label}

                                                                    </button>

                                                                ))}

                                                            </div>

                                                        </div>

                                                    </div>

                                

                                                    <div className="h-0.5 bg-zinc-800/10 w-full max-w-md mx-auto" />

                                

                                                    {/* Windy Season Question */}

                                                    <div className="space-y-8 text-center">

                                                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">When is your windy season?</h3>

                                                        <div className="flex justify-center mx-auto items-center gap-6">

                                                            <div className="p-4 rounded-2xl bg-blue-100 text-blue-600">

                                                                <Wind size={40} className="w-10 h-10" />

                                                            </div>

                                                            <div className="flex flex-wrap justify-center gap-4">

                                                                {["All Year", "Winter", "Summer"].map((opt) => (

                                                                    <button

                                                                        key={opt}

                                                                        onClick={() => setSeason(opt)}

                                                                        className={`px-10 py-3 rounded-2xl text-base font-black transition-all border ${

                                                                            season === opt

                                                                                ? "bg-indigo-600 text-white border-transparent shadow-lg scale-105"

                                                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"

                                                                        }`}

                                                                    >

                                                                        {opt}

                                                                    </button>

                                                                ))}

                                                            </div>

                                                        </div>

                                                    </div>

                                

                                                    <div className="h-0.5 bg-zinc-800/10 w-full max-w-md mx-auto" />

                                

                                                    {/* Export Preference */}

                                                    <div className="space-y-8 text-center">

                                                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">How do you want your data exported?</h3>

                                                        <div className="flex justify-center mx-auto items-center gap-6">

                                                            <div className="p-4 rounded-2xl bg-purple-100 text-purple-600">

                                                                <KiteIcon size={40} className="w-10 h-10" />

                                                            </div>

                                                            <div className="flex flex-wrap justify-center gap-4">

                                                                {["PDF Report", "Excel Sheet", "CSV File"].map((format) => (

                                                                    <button

                                                                        key={format}

                                                                        onClick={() => setExportFormat(format)}

                                                                        className={`px-10 py-3 rounded-2xl text-base font-black transition-all border ${

                                                                            exportFormat === format

                                                                                ? "bg-indigo-600 text-white border-transparent shadow-lg scale-105"

                                                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"

                                                                        }`}

                                                                    >

                                                                        {format}

                                                                    </button>

                                                                ))}

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>
            </div>
        </section>
    );
}
