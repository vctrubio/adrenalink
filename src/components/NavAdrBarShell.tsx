"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavAdrBarShellProps {
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
}

export default function NavAdrBarShell({ leftSlot, rightSlot }: NavAdrBarShellProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-2 pointer-events-none">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-between pointer-events-auto bg-background/60 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/20 dark:border-white/10 shadow-sm mx-auto max-w-7xl mt-2 transition-all hover:bg-background/80 min-h-[60px]"
            >
                {/* Left Slot */}
                <div className="hidden md:block">
                    {leftSlot}
                </div>

                {/* Center: Adrenalink Branding - ALWAYS visible, never suspended */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="font-bold text-2xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
                        Adrenalink
                    </Link>
                </div>

                {/* Right Slot */}
                <div className="ml-auto">
                    {rightSlot}
                </div>
            </motion.div>
        </header>
    );
}
