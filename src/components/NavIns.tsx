"use client";

import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Settings, LogOut } from "lucide-react";
import { STUDENT_NAV_ITEMS, TEACHER_NAV_ITEMS } from "@/config/users-nav-routes";

// --- Icons ---

const NoWindIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path
            fill="currentColor"
            d="M16.64,13.634C16.993,13.874,17.411,14,17.85,14c0.753,0,1.461-0.395,1.846-1.029    c0.308-0.503,0.383-1.107,0.208-1.657c-0.178-0.556-0.596-1.01-1.148-1.244l-3.811-1.62c-0.158-0.848-0.675-1.564-1.385-2    l0.422-4.243C13.997,2.124,14,2.042,14,1.96C14,0.879,13.103,0,12,0c-0.572,0-1.118,0.241-1.497,0.662    c-0.369,0.409-0.548,0.956-0.491,1.498l0.428,4.29c-0.71,0.436-1.227,1.152-1.385,2l-3.811,1.62    c-0.552,0.234-0.97,0.688-1.148,1.244c-0.176,0.55-0.101,1.154,0.207,1.656C4.689,13.605,5.396,14,6.15,14    c0.439,0,0.857-0.126,1.211-0.366l3.069-2.089c0.12,0.074,0.243,0.146,0.373,0.203L9.006,23.424    c-0.022,0.144,0.02,0.291,0.115,0.402C9.215,23.937,9.354,24,9.5,24h5c0.146,0,0.285-0.063,0.379-0.174    c0.095-0.111,0.137-0.258,0.115-0.402l-1.798-11.676c0.131-0.057,0.253-0.128,0.373-0.203L16.64,13.634z M10,9c0-1.103,0.897-2,2-2    s2,0.897,2,2s-0.897,2-2,2S10,10.103,10,9z M18.951,11.619c0.089,0.277,0.05,0.572-0.108,0.832c-0.324,0.536-1.14,0.697-1.642,0.356    l-2.864-1.949c0.302-0.379,0.518-0.826,0.608-1.321l3.419,1.453C18.652,11.112,18.861,11.335,18.951,11.619z M11.007,2.058    c-0.028-0.267,0.057-0.525,0.24-0.727C11.436,1.121,11.71,1,12,1c0.551,0,1,0.431,1,0.96l-0.407,4.1C12.401,6.021,12.203,6,12,6    c-0.203,0-0.401,0.021-0.593,0.06L11.007,2.058z M6.8,12.806c-0.503,0.342-1.316,0.18-1.644-0.357    c-0.158-0.258-0.196-0.553-0.107-0.83c0.09-0.283,0.299-0.506,0.587-0.629l3.419-1.453c0.09,0.495,0.307,0.942,0.608,1.321    L6.8,12.806z M13.917,23h-3.834l1.697-11.022C11.854,11.983,11.925,12,12,12s0.146-0.017,0.22-0.022L13.917,23z"
        />
        <circle cx="12" cy="9" r="1" fill="currentColor" />
    </svg>
);

const WindIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path
            fill="currentColor"
            d="M16.64,13.634C16.993,13.874,17.411,14,17.85,14c0.753,0,1.461-0.395,1.846-1.029    c0.308-0.503,0.383-1.107,0.208-1.657c-0.178-0.556-0.596-1.01-1.148-1.244l-3.811-1.62c-0.158-0.848-0.675-1.564-1.385-2    l0.422-4.243C13.997,2.124,14,2.042,14,1.96C14,0.879,13.103,0,12,0c-0.572,0-1.118,0.241-1.497,0.662    c-0.369,0.409-0.548,0.956-0.491,1.498l0.428,4.29c-0.71,0.436-1.227,1.152-1.385,2l-3.811,1.62    c-0.552,0.234-0.97,0.688-1.148,1.244c-0.176,0.55-0.101,1.154,0.207,1.656C4.689,13.605,5.396,14,6.15,14    c0.439,0,0.857-0.126,1.211-0.366l3.069-2.089c0.12,0.074,0.243,0.146,0.373,0.203L9.006,23.424    c-0.022,0.144,0.02,0.291,0.115,0.402C9.215,23.937,9.354,24,9.5,24h5c0.146,0,0.285-0.063,0.379-0.174    c0.095-0.111,0.137-0.258,0.115-0.402l-1.798-11.676c0.131-0.057,0.253-0.128,0.373-0.203L16.64,13.634z M10,9c0-1.103,0.897-2,2-2    s2,0.897,2,2s-0.897,2-2,2S10,10.103,10,9z M18.951,11.619c0.089,0.277,0.05,0.572-0.108,0.832    c-0.325,0.536-1.139,0.697-1.642,0.356l-2.864-1.949c0.302-0.379,0.518-0.826,0.608-1.321l3.419,1.453    C18.652,11.112,18.861,11.335,18.951,11.619z M11.007,2.058c-0.028-0.267,0.057-0.525,0.24-0.727C11.436,1.121,11.71,1,12,1    c0.551,0,1,0.431,1,0.96l-0.407,4.1C12.401,6.021,12.203,6,12,6c-0.203,0-0.401,0.021-0.593,0.06L11.007,2.058z M6.8,12.806    c-0.504,0.342-1.317,0.18-1.644-0.357c-0.158-0.258-0.196-0.553-0.107-0.83c0.09-0.283,0.299-0.506,0.587-0.629l3.419-1.453    c0.09,0.495,0.307,0.942,0.608,1.321L6.8,12.806z M13.917,23h-3.834l1.697-11.022C11.854,11.983,11.925,12,12,12    s0.146-0.017,0.22-0.022L13.917,23z"
        />
        <path
            fill="currentColor"
            d="M15.421,2.892c-0.242-0.137-0.546-0.051-0.681,0.19c-0.136,0.241-0.051,0.545,0.19,0.681    c0.145,0.082,0.287,0.169,0.423,0.261c0.16,0.108,0.314,0.223,0.463,0.346c0.148,0.123,0.291,0.252,0.426,0.388    s0.265,0.278,0.388,0.426c0.123,0.148,0.238,0.303,0.345,0.462c0.108,0.16,0.208,0.324,0.3,0.495    c0.092,0.17,0.177,0.344,0.253,0.523c0.076,0.18,0.143,0.364,0.202,0.551c0.058,0.188,0.107,0.379,0.147,0.576    c0.036,0.174,0.064,0.351,0.084,0.53c0.029,0.255,0.246,0.444,0.497,0.444c0.019,0,0.038-0.001,0.057-0.003    c0.274-0.031,0.472-0.279,0.441-0.553c-0.024-0.209-0.057-0.416-0.099-0.618c-0.046-0.228-0.104-0.452-0.172-0.672    c-0.068-0.219-0.147-0.434-0.235-0.643c-0.088-0.209-0.187-0.414-0.295-0.612c-0.108-0.199-0.225-0.392-0.351-0.579    c-0.126-0.186-0.26-0.365-0.403-0.538c-0.142-0.172-0.293-0.338-0.451-0.497s-0.324-0.309-0.497-0.451    c-0.173-0.143-0.352-0.277-0.539-0.404C15.754,3.088,15.59,2.986,15.421,2.892z"
        />
        <path
            fill="currentColor"
            d="M6.599,4.547C6.456,4.72,6.322,4.899,6.195,5.086C6.07,5.272,5.953,5.465,5.845,5.663    S5.639,6.066,5.55,6.275C5.462,6.484,5.383,6.699,5.314,6.919c-0.068,0.22-0.126,0.444-0.172,0.67    C5.096,7.817,5.06,8.049,5.036,8.286C5.009,8.56,5.209,8.805,5.484,8.833C5.5,8.834,5.518,8.835,5.534,8.835    c0.254,0,0.471-0.192,0.497-0.45c0.02-0.201,0.051-0.4,0.091-0.596c0.04-0.195,0.089-0.387,0.147-0.574    c0.059-0.188,0.126-0.372,0.202-0.552C6.547,6.485,6.632,6.311,6.724,6.14s0.192-0.335,0.3-0.494    c0.108-0.16,0.223-0.314,0.346-0.463c0.123-0.148,0.252-0.291,0.388-0.426S8.036,4.492,8.184,4.37    c0.148-0.123,0.303-0.238,0.462-0.345c0.16-0.108,0.324-0.208,0.495-0.3c0.243-0.131,0.333-0.435,0.201-0.678    C9.21,2.803,8.906,2.713,8.664,2.845C8.465,2.953,8.272,3.07,8.085,3.196C7.899,3.322,7.72,3.456,7.547,3.599    C7.375,3.741,7.208,3.892,7.05,4.05S6.741,4.375,6.599,4.547z"
        />
    </svg>
);

// --- Configuration ---

interface NavItemConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    path: string;
    gradient: string;
}

// --- Helper Components ---

function MacOsPopFiles({ isOpen, onClose, isMobile = false }: { isOpen: boolean; onClose: () => void, isMobile?: boolean }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };

    const handleLogout = () => {
        console.log("logging out...");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-[60]" onClick={onClose} />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className={`
                            absolute p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl z-[70] flex flex-col gap-1 min-w-[180px]
                            ${isMobile ? "bottom-[135%] right-2 mb-0 origin-bottom-right" : "bottom-[125%] right-0 mb-2 origin-bottom"}
                        `}
                    >
                        {/* Theme Item */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-white/10 transition-all group text-left relative overflow-hidden"
                        >
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 transition-transform group-hover:scale-105 text-foreground">
                                {isDarkMode ? (
                                    <WindIcon className="w-5 h-5" />
                                ) : (
                                    <NoWindIcon className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex flex-col z-10">
                                <span className="text-sm font-semibold text-foreground tracking-tight">Theme</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{isDarkMode ? 'Wind Mode' : 'Static Mode'}</span>
                            </div>
                        </button>

                        <div className="h-px bg-neutral-200/50 dark:bg-neutral-700/50 mx-2" />

                        {/* Logout Item */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-white/10 transition-all group text-left relative overflow-hidden"
                        >
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 transition-transform group-hover:scale-105 text-foreground">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col z-10">
                                <span className="text-sm font-semibold text-foreground tracking-tight">Logout</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">End Session</span>
                            </div>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// --- Dock Components ---

function DockIcon({
    mouseX,
    children,
    label,
    href,
    isActive,
    onClick,
    customClass = "",
}: {
    mouseX: MotionValue;
    children: React.ReactNode;
    label: string;
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
    customClass?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-100, 0, 100], [50, 85, 50]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 300, damping: 18 });

    const content = (
        <motion.div
            ref={ref}
            style={{ width, height: width }}
            className={`aspect-square rounded-[22.5%] flex items-center justify-center relative transition-all duration-200 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-lg border border-white/40 dark:border-white/5 ${customClass}`}
        >
            <div className="w-full h-full p-[24%] text-neutral-800 dark:text-neutral-100">
                {children}
            </div>

            {/* Active Dot */}
            {isActive && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-neutral-500/60 dark:bg-neutral-400/60 rounded-full" />
            )}
        </motion.div>
    );

    const tooltip = (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl text-neutral-900 dark:text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-black/5 dark:border-white/10 scale-90 group-hover:scale-100 origin-bottom duration-200">
            {label}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="relative group">
                {content}
                {tooltip}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="relative group outline-none">
            {content}
            {tooltip}
        </button>
    );
}

function SettingsFolder({ mouseX, isMobile = false }: { mouseX?: MotionValue; isMobile?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const fallbackMouseX = useMotionValue(Infinity); 
    const effectiveMouseX = mouseX || fallbackMouseX;

    if (isMobile) {
        return (
            <div className="relative flex-1 flex flex-col items-center justify-center h-full">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-all active:scale-95"
                >
                    <Settings size={26} className={`stroke-2 ${isOpen ? "text-foreground" : ""}`} />
                </button>
                <MacOsPopFiles isOpen={isOpen} onClose={() => setIsOpen(false)} isMobile={true} />
            </div>
        );
    }

    return (
        <div className="relative h-full flex items-center">
            <DockIcon mouseX={effectiveMouseX} label="Settings" onClick={() => setIsOpen(!isOpen)} customClass="hover:bg-neutral-100 dark:hover:bg-zinc-700">
                <div className="w-full h-full text-neutral-600 dark:text-neutral-300">
                    <Settings className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
            </DockIcon>
            <MacOsPopFiles isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}

function DesktopDock({ items, basePath, mouseX }: { items: NavItemConfig[]; basePath: string; mouseX: MotionValue }) {
    const pathname = usePathname();

    return (
        <nav
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 h-24 items-end gap-4 z-50 pointer-events-none"
        >
            <div className="flex items-end gap-3 px-4 pb-3 rounded-[26px] pointer-events-auto bg-white/60 dark:bg-black/40 border border-white/30 dark:border-white/5 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5 h-[80px] box-content relative">
                {items.map((item) => {
                    const href = `${basePath}${item.path}`;
                    const isActive = pathname === href || (item.path === "" && pathname === basePath);
                    const Icon = item.icon;
                    return (
                        <DockIcon 
                            key={item.id} 
                            mouseX={mouseX} 
                            label={item.label} 
                            href={href} 
                            isActive={isActive}
                        >
                            <Icon className="w-full h-full" />
                        </DockIcon>
                    );
                })}
                
                <div className="w-[1.5px] h-10 bg-neutral-400/20 dark:bg-neutral-600/30 mx-1 self-center" />
                
                <div className="h-full flex items-end pb-0">
                    <SettingsFolder mouseX={mouseX} />
                </div>
            </div>
        </nav>
    );
}

function MobileNavItem({ item, basePath }: { item: NavItemConfig; basePath: string }) {
    const pathname = usePathname();
    const href = `${basePath}${item.path}`;
    const isActive = pathname === href || (item.path === "" && pathname === basePath);
    const Icon = item.icon;

    return (
        <Link
            href={href}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
                isActive ? "text-foreground" : "text-muted-foreground/80"
            }`}
        >
            <Icon size={26} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
        </Link>
    );
}

function MobileBar({ items, basePath }: { items: NavItemConfig[]; basePath: string }) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-background/80 backdrop-blur-2xl border-t border-border/40 flex items-center z-50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            {items.map((item) => (
                <div key={item.id} className="contents">
                    <MobileNavItem item={item} basePath={basePath} />
                    <div className="w-px h-5 bg-border/30" /> 
                </div>
            ))}
            
            <SettingsFolder isMobile={true} />
        </nav>
    );
}

// --- Main Component ---

export default function NavIns() {
    const mouseX = useMotionValue(Infinity);
    const pathname = usePathname();
    const params = useParams();
    const id = params?.id as string;

    // Determine role and base path
    const isTeacher = pathname?.includes("/teacher/");
    const navItems = isTeacher ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;
    const basePath = isTeacher ? `/teacher/${id}` : `/student/${id}`;

    // Don't render if ID is missing (e.g. not in a user route)
    if (!id) return null;

    return (
        <>
            <MobileBar items={navItems} basePath={basePath} />
            <DesktopDock items={navItems} basePath={basePath} mouseX={mouseX} />
        </>
    );
}
