"use client";

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
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
            {items.map((item, index) => (
                <div key={item.id} className="contents">
                    <MobileNavItem item={item} basePath={basePath} />
                    {index < items.length - 1 && <div className="w-px h-5 bg-border/30" />}
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
