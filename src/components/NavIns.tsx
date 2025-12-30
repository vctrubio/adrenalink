"use client";

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { STUDENT_NAV_ITEMS, TEACHER_NAV_ITEMS } from "@/config/users-nav-routes";

// --- Configuration ---

interface NavItemConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    path: string;
    gradient: string;
}

// --- Dock Components ---

function DockIcon({
    mouseX,
    children,
    label,
    href,
    isActive,
    onClick,
}: {
    mouseX: MotionValue;
    children: React.ReactNode;
    label: string;
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [45, 85, 45]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
    
    const [isHovered, setHovered] = useState(false);

    const content = (
        <motion.div
            ref={ref}
            style={{ width, height: width }}
            className={`
                aspect-square rounded-2xl flex items-center justify-center relative 
                transition-all duration-200 ease-out border
                ${isActive 
                    ? "bg-white/90 dark:bg-neutral-800/90 shadow-lg border-white/20 dark:border-white/10" 
                    : "bg-white/10 dark:bg-white/5 border-white/10 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/10"
                }
                backdrop-blur-md
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={`w-full h-full p-[22%] transition-colors duration-200 ${isActive ? "text-black dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}>
                {children}
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-black/50 dark:bg-white/50 rounded-full" />
            )}
            
            {/* Tooltip */}
            <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-md rounded-lg text-neutral-900 dark:text-neutral-100 text-[10px] font-semibold opacity-0 pointer-events-none whitespace-nowrap"
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5, scale: isHovered ? 1 : 0.9 }}
                transition={{ duration: 0.15 }}
            >
                {label}
            </motion.div>
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="relative block">
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="relative block outline-none">
            {content}
        </button>
    );
}

function DesktopDock({ items, basePath, mouseX }: { items: NavItemConfig[]; basePath: string; mouseX: MotionValue }) {
    const pathname = usePathname();

    return (
        <nav
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 h-24 items-end gap-4 z-50 pointer-events-none"
        >
            <div className="flex items-end gap-3 px-3 pb-3 rounded-[32px] pointer-events-auto bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/5">
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
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-95 hover:bg-neutral-100/50 dark:hover:bg-white/5`}
        >
            <div className={`relative p-2 rounded-xl transition-colors ${isActive ? "text-black dark:text-white" : "text-neutral-400 dark:text-neutral-500"}`}>
                <Icon size={24} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
                )}
            </div>
        </Link>
    );
}

function MobileBar({ items, basePath }: { items: NavItemConfig[]; basePath: string }) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 flex items-center z-50 pb-safe">
            {items.map((item, index) => (
                <div key={item.id} className="contents">
                    <MobileNavItem item={item} basePath={basePath} />
                    {index < items.length - 1 && (
                        <div className="w-[2.5px] h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full shrink-0" />
                    )}
                </div>
            ))}
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
