"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

// --- Constants & Configuration ---

const BRAND_CONFIG = {
    name: "Adrenalink",
    logoSrc: "/ADR.webp",
    logoAlt: "Adrenalink Logo",
    logoSize: 120,
};

const DEFAULT_COLORS = {
    admin: "#3b82f6", // secondary (blue)
    student: "#eab308",
    teacher: "#22c55e",
};

const ROLES_CONFIG = [
    {
        id: "admin",
        label: "Administration",
        merchLabel: "Headquarters",
        description: "Reservation Management",
        Icon: AdminIcon,
        defaultColor: DEFAULT_COLORS.admin,
    },
    {
        id: "student",
        label: "Student",
        merchLabel: "Student",
        description: "Connecting Students",
        Icon: HelmetIcon,
        defaultColor: DEFAULT_COLORS.student,
    },
    {
        id: "teacher",
        label: "Teacher",
        merchLabel: "Teacher",
        description: "Instructors",
        Icon: HeadsetIcon,
        defaultColor: DEFAULT_COLORS.teacher,
    },
] as const;

type RoleId = (typeof ROLES_CONFIG)[number]["id"];

interface RoleState {
    showName: boolean;
    showDescription: boolean;
    showBackground: boolean;
    color: string;
}

// --- Icons ---
function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// --- Sub-Components ---

function NavShell({ leftSlot, rightSlot }: { leftSlot?: ReactNode; rightSlot?: ReactNode }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-between pointer-events-auto bg-background/60 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 dark:border-white/10 shadow-lg mx-auto max-w-7xl mt-4 transition-all hover:bg-background/80 min-h-[64px]"
            >
                {/* Left Slot - Controls */}
                <div className="flex items-center gap-4">{leftSlot}</div>

                {/* Right Slot - Actions */}
                <div className="ml-auto flex items-center gap-4">{rightSlot}</div>
            </motion.div>
        </header>
    );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${active
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
                }`}
        >
            <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${active ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}
            >
                {active && <CheckIcon className="w-2.5 h-2.5 text-primary-foreground" />}
            </div>
            {label}
        </button>
    );
}

function RoleCard({
    role,
    state,
    onUpdate,
}: {
    role: (typeof ROLES_CONFIG)[number];
    state: RoleState;
    onUpdate: (updates: Partial<RoleState>) => void;
}) {
    const { Icon, label, description } = role;
    const { showName, showDescription, showBackground, color } = state;

    return (
        <div className="flex flex-col items-center group relative p-8">
            {/* Minimal Local Controls */}
            <div className="absolute -top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm z-10">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="w-5 h-5 rounded-full border-none cursor-pointer bg-transparent"
                    title="Change Color"
                />
                <div className="w-px h-4 bg-border mx-1" />
                <button
                    onClick={() => onUpdate({ showName: !showName })}
                    className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${showName ? "bg-primary text-primary-foreground border-transparent" : "text-muted-foreground border-border"}`}
                    title="Toggle Name"
                >
                    T
                </button>
                <button
                    onClick={() => onUpdate({ showDescription: !showDescription })}
                    className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${showDescription ? "bg-primary text-primary-foreground border-transparent" : "text-muted-foreground border-border"}`}
                    title="Toggle Description"
                >
                    D
                </button>
                <button
                    onClick={() => onUpdate({ showBackground: !showBackground })}
                    className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${showBackground ? "bg-primary text-primary-foreground border-transparent" : "text-muted-foreground border-border"}`}
                    title="Toggle Background"
                >
                    B
                </button>
            </div>

            {/* Icon Display */}
            <div
                className="mb-8 rounded-[2.5rem] p-10 transition-all duration-500 ease-out"
                style={{
                    backgroundColor: showBackground ? `${color}15` : "transparent",
                    color: color,
                    transform: showBackground ? "scale(1)" : "scale(0.95)",
                }}
            >
                <Icon size={96} className="w-24 h-24 drop-shadow-sm" />
            </div>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-2 min-h-[6rem]">
                <div
                    className={`transition-all duration-300 overflow-hidden ${showName ? "opacity-100 max-h-12 translate-y-0" : "opacity-0 max-h-0 -translate-y-2"
                        }`}
                >
                    <h3 className="text-3xl font-bold text-foreground tracking-tight">{label}</h3>
                </div>

                <div
                    className={`transition-all duration-300 overflow-hidden ${showDescription ? "opacity-100 max-h-32 translate-y-0" : "opacity-0 max-h-0 -translate-y-2"
                        }`}
                >
                    <p
                        className="text-foreground font-mono text-sm md:text-base font-black tracking-tighter text-center leading-tight max-w-[200px]"
                        style={{
                            fontFamily: "ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- T-Shirt Components ---

function TShirtShape({
    color = "currentColor",
    children,
    className = "",
}: {
    color?: string;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <div className={`relative ${className}`}>
            <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-xl" fill={color} xmlns="http://www.w3.org/2000/svg">
                {/* Classic T-Shirt Shape */}
                <path d="M378.5,64H345.2c-7.3-17.5-24.8-32-49.2-32s-41.9,14.5-49.2,32H133.5C118,64,103.4,72.8,97.2,87L58.1,176.6c-4.3,9.8-1.7,21.3,6.3,28.4l24.9,22.1c8.1,7.2,20.3,6.8,27.8-0.9L144,198.6V448c0,17.7,14.3,32,32,32H336c17.7,0,32-14.3,32-32V198.6l26.9,27.6c7.5,7.7,19.7,8.1,27.8,0.9l24.9-22.1c8-7.1,10.6-18.6,6.3-28.4L414.8,87C408.6,72.8,394,64,378.5,64Z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[60%] h-[70%] mt-[15%] relative flex flex-col items-center">{children}</div>
            </div>
        </div>
    );
}

function MerchCard({ role, state, schoolName }: { role: (typeof ROLES_CONFIG)[number]; state: RoleState; schoolName: string }) {
    const { Icon, merchLabel, description } = role;
    const { color } = state;

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">{role.label} Merch</h3>

            {/* Front View */}
            <div className="w-full max-w-[280px] aspect-[4/5] relative">
                <div className="absolute top-0 left-0 bg-muted-foreground/10 text-muted-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg z-10">
                    FRONT
                </div>
                <TShirtShape color="#f1f5f9" className="text-slate-100">
                    <div className="absolute top-[12%] left-[55%] w-[25%] flex flex-col items-center gap-1">
                        <Image
                            src={BRAND_CONFIG.logoSrc}
                            alt="Pocket Logo"
                            width={40}
                            height={40}
                            className="object-contain opacity-90"
                        />
                        <span className="text-[6px] font-black tracking-widest text-slate-800 uppercase text-center w-full truncate">
                            {schoolName}
                        </span>
                    </div>
                </TShirtShape>
            </div>

            {/* Back View 1 (Label) */}
            <div className="w-full max-w-[280px] aspect-[4/5] relative">
                <div className="absolute top-0 left-0 bg-muted-foreground/10 text-muted-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg z-10">
                    BACK A
                </div>
                <TShirtShape color="#f1f5f9" className="text-slate-100">
                    <div className="flex flex-col items-center justify-center h-full gap-4 pt-4">
                        <div className="text-slate-800">
                            <Icon size={48} className="w-12 h-12" />
                        </div>
                        <p
                            className="text-slate-800 font-mono text-[8px] font-black tracking-[0.2em] text-center leading-tight max-w-[100px] uppercase"
                            style={{ letterSpacing: "0.2em" }}
                        >
                            {merchLabel}
                        </p>
                    </div>
                </TShirtShape>
            </div>

            {/* Back View 2 (Description) */}
            <div className="w-full max-w-[280px] aspect-[4/5] relative">
                <div className="absolute top-0 left-0 bg-muted-foreground/10 text-muted-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg z-10">
                    BACK B
                </div>
                <TShirtShape color="#f1f5f9" className="text-slate-100">
                    <div className="flex flex-col items-center justify-center h-full gap-4 pt-4">
                        <div className="text-slate-800">
                            <Icon size={48} className="w-12 h-12" />
                        </div>
                        <p
                            className="text-slate-800 font-mono text-[8px] font-black tracking-[0.1em] text-center leading-tight max-w-[100px]"
                            style={{ letterSpacing: "0.1em" }}
                        >
                            {description}
                        </p>
                    </div>
                </TShirtShape>
            </div>
        </div>
    );
}

function MerchShowcase({
    roles,
    states,
    schoolName,
    onSchoolNameChange,
}: {
    roles: typeof ROLES_CONFIG;
    states: Record<RoleId, RoleState>;
    schoolName: string;
    onSchoolNameChange: (val: string) => void;
}) {
    return (
        <div className="w-full max-w-7xl px-8 mt-40">
            <div className="flex flex-col items-center gap-6 mb-20">
                <h2 className="text-4xl font-black tracking-tight text-center text-foreground/80">T-Shirt Presentation</h2>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">School Name</span>
                    <div className="relative inline-block">
                        <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => onSchoolNameChange(e.target.value)}
                            className="bg-transparent border-b-2 border-foreground focus:border-primary outline-none px-1 transition-colors text-3xl font-black tracking-tighter text-center"
                            style={{ width: `${Math.max(schoolName.length, 1) + 2}ch` }}
                            placeholder="School Name"
                        />
                    </div>
                    {/* Subdomain Preview */}
                    <div className="mt-4 px-4 py-2 bg-muted/50 rounded-full border border-border/50">
                        <p className="text-sm font-mono text-muted-foreground">
                            <span className="font-bold text-secondary">
                                {schoolName.toLowerCase().replace(/\s+/g, "") || "school"}
                            </span>
                            .adrenalink.tech
                        </p>
                    </div>
                </div>
            </div>
            {/* Grid Layout for Roles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {roles.map((role) => (
                    <MerchCard key={role.id} role={role} state={states[role.id]} schoolName={schoolName} />
                ))}
            </div>
        </div>
    );
}

// --- Brand Icon Styling Components ---

function BrandIconStyling() {
    return (
        <div className="w-full max-w-7xl px-8 mt-40 mb-40">
            <h2 className="text-4xl font-black tracking-tight text-center mb-20 text-foreground/80">App Store n More</h2>

            <div className="flex flex-wrap items-start justify-center gap-10">
                {/* App Icon Styling */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-48 h-48 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border border-white/50 bg-gradient-to-b from-white to-slate-100 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                        <Image
                            src={BRAND_CONFIG.logoSrc}
                            alt="App Icon"
                            width={140}
                            height={140}
                            className="object-contain drop-shadow-md"
                        />
                    </div>
                    {/* App Name Label (Home Screen Style) */}
                    <span className="text-lg font-medium tracking-tight text-foreground/90">Adrenalink</span>

                    <div className="text-center mt-4">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">App Icon</h3>
                        <p className="text-sm text-muted-foreground mt-1">macOS / iOS Standard</p>
                    </div>
                </div>

                {/* OG Share Card Styling */}
                <div className="w-full max-w-[500px] bg-card border border-border rounded-xl overflow-hidden shadow-lg flex flex-col sm:flex-row h-auto sm:h-[180px]">
                    {/* Image Section */}
                    <div className="w-full sm:w-[180px] h-[180px] sm:h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden group shrink-0 gap-2">
                        {/* Abstract Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_60s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_180deg,transparent_360deg)]" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-2 transition-transform duration-500 group-hover:scale-105">
                            <Image
                                src={BRAND_CONFIG.logoSrc}
                                alt="OG Logo"
                                width={60}
                                height={60}
                                className="object-contain drop-shadow-2xl brightness-0 invert"
                            />
                            <span className="text-white font-bold tracking-tight text-sm">Adrenalink</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 flex flex-col justify-center bg-card">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">adrenalink.tech</p>
                        <h3 className="text-lg font-bold text-foreground mb-1.5 leading-tight">Reservation Management</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Connecting schools, students and teachers to synchronize adrenaline activity.
                        </p>{" "}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Samurai Layout Component ---

function SamuraiPreview({ roles }: { roles: typeof ROLES_CONFIG }) {
    return (
        <div className="w-full max-w-7xl px-8 mt-40 mb-20">
            <div className="flex flex-col md:flex-row h-[600px] w-full overflow-hidden rounded-none shadow-none bg-zinc-50">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="group relative flex-1 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out hover:flex-[1.5] border-b md:border-b-0 md:border-r last:border-0 border-zinc-200 hover:bg-zinc-100 overflow-hidden"
                    >
                        {/* Vertical Divider Line (Samurai Sword aesthetic) */}
                        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-zinc-300 group-last:hidden" />

                        <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                            <role.Icon size={60} className="w-16 h-16 text-zinc-800" />
                        </div>

                        <h3 className="relative z-10 mt-12 text-lg font-black uppercase tracking-[0.2em] text-zinc-900 group-hover:tracking-[0.3em] transition-all duration-500 vertical-rl md:writing-mode-horizontal">
                            {role.label}
                        </h3>

                        <div className="w-1 h-12 bg-red-600 mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <p className="relative z-10 mt-8 text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 text-center max-w-[200px] opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-75">
                            {role.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Ad Campaign Component ---

function AdCampaign() {
    return (
        <div className="w-full max-w-7xl px-8 mt-60 mb-80 flex flex-col items-center">
            <div className="relative flex flex-col items-end">
                {/* Main Branding with Dot as Full Stop */}
                <h1 className="text-[12vw] md:text-[14rem] font-serif font-black tracking-tight text-[#1a202c] leading-[0.8] flex items-end">
                    Adrenalink
                    <div className="w-[2vw] h-[2vw] md:w-8 md:h-8 rounded-full bg-blue-500 ml-1 translate-y-[-1vw] md:translate-y-[-1rem]" />
                </h1>

                {/* Tech Subtitle - Uppercase */}
                <div className="flex items-center -mt-[2vw] md:-mt-8 mr-[2vw] md:mr-8">
                    <span className="text-[6vw] md:text-[7rem] font-serif font-black tracking-tighter text-[#1a202c] uppercase">
                        tech
                    </span>
                </div>
            </div>
        </div>
    );
}

// --- Brand Colors Component ---

function BrandColors() {
    return (
        <div className="w-full max-w-7xl px-8 flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-12">
                {[
                    { label: "Administration", color: DEFAULT_COLORS.admin },
                    { label: "Student", color: DEFAULT_COLORS.student },
                    { label: "Teacher", color: DEFAULT_COLORS.teacher },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-4">
                        <div
                            className="w-32 h-32 rounded-[2rem] shadow-lg border border-white/20 transition-transform hover:scale-105"
                            style={{ backgroundColor: item.color }}
                        />
                        <div className="text-center">
                            <span className="text-sm font-black uppercase tracking-widest text-foreground/80">{item.label}</span>
                            <p className="text-xs font-mono text-muted-foreground mt-1 uppercase">{item.color}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function DesignStyleGuide() {
    const [schoolName, setSchoolName] = useState("Feelviana");
    // Centralized state
    const [states, setStates] = useState<Record<RoleId, RoleState>>(() => {
        const initial: Record<string, RoleState> = {};
        ROLES_CONFIG.forEach((r) => {
            initial[r.id] = {
                showName: true,
                showDescription: true,
                showBackground: true,
                color: r.defaultColor,
            };
        });
        return initial;
    });

    // Helpers
    const updateRole = (id: RoleId, updates: Partial<RoleState>) => {
        setStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...updates },
        }));
    };

    const toggleGlobal = (key: keyof Pick<RoleState, "showName" | "showDescription" | "showBackground">) => {
        const allActive = Object.values(states).every((s) => s[key]);
        const newValue = !allActive;

        setStates((prev) => {
            const next = { ...prev };
            (Object.keys(next) as RoleId[]).forEach((id) => {
                next[id] = { ...next[id], [key]: newValue };
            });
            return next;
        });
    };

    const resetColors = () => {
        setStates((prev) => {
            const next = { ...prev };
            ROLES_CONFIG.forEach((role) => {
                next[role.id] = { ...next[role.id], color: role.defaultColor };
            });
            return next;
        });
    };

    // Derived global states
    const allNames = Object.values(states).every((s) => s.showName);
    const allDescs = Object.values(states).every((s) => s.showDescription);
    const allBgs = Object.values(states).every((s) => s.showBackground);

    return (
        <main className="min-h-screen bg-background relative selection:bg-primary/20 pb-40">
            {/* Nav Shell for controls only */}
            {/* <NavShell */}
            {/*     leftSlot={ */}
            {/*         <> */}
            {/*             <ToggleButton active={allNames} onClick={() => toggleGlobal("showName")} label="Names" /> */}
            {/*             <ToggleButton active={allDescs} onClick={() => toggleGlobal("showDescription")} label="Descriptions" /> */}
            {/*             <ToggleButton active={allBgs} onClick={() => toggleGlobal("showBackground")} label="Backgrounds" /> */}
            {/*         </> */}
            {/*     } */}
            {/*     rightSlot={ */}
            {/*         <button */}
            {/*             onClick={resetColors} */}
            {/*             className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" */}
            {/*         > */}
            {/*             Reset Colors */}
            {/*         </button> */}
            {/*     } */}
            {/* /> */}

            <div className="flex flex-col items-center justify-center pt-40">
                {/* Branding outside of header */}
                <div className="flex items-center gap-10 my-12 scale-110">
                    <Image
                        src={BRAND_CONFIG.logoSrc}
                        alt={BRAND_CONFIG.logoAlt}
                        width={BRAND_CONFIG.logoSize}
                        height={BRAND_CONFIG.logoSize}
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                    <h1 className="text-8xl font-black tracking-tighter text-foreground">{BRAND_CONFIG.name}</h1>
                </div>

                {/* Samurai Layout Section */}
                <SamuraiPreview roles={[...ROLES_CONFIG]} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-7xl px-8">
                    {ROLES_CONFIG.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            state={states[role.id]}
                            onUpdate={(updates) => updateRole(role.id, updates)}
                        />
                    ))}
                </div>

                {/* New Merch Section */}
                <MerchShowcase roles={[...ROLES_CONFIG]} states={states} schoolName={schoolName} onSchoolNameChange={setSchoolName} />

                {/* Brand Icon Styling Section */}
                <BrandIconStyling />

                {/* Ad Campaign Section */}
                <AdCampaign />

                {/* Brand Colors Section */}
                <BrandColors />
            </div>
        </main>
    );
}
