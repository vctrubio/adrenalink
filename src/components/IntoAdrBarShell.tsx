"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface IntoAdrBarShellProps {
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
    inverted?: boolean;
    onBarClick?: string;
}

export default function IntoAdrBarShell({ leftSlot, rightSlot, inverted = false, onBarClick }: IntoAdrBarShellProps) {
    const router = useRouter();
    const bgClasses = inverted
        ? "bg-transparent hover:bg-black/60"
        : "bg-black/60 hover:bg-black/40";

    const handleBarClick = () => {
        if (onBarClick) {
            router.push(onBarClick);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-2 pointer-events-none">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={handleBarClick}
                className={`relative flex items-center justify-between pointer-events-auto ${bgClasses} backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/20 dark:border-white/10 shadow-sm mx-auto max-w-7xl mt-2 transition-all min-h-[60px] ${onBarClick ? "cursor-pointer" : ""}`}
            >
                {/* Left Slot */}
                <div className="">
                    {leftSlot}
                </div>

                {/* Center: Adrenalink Branding */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                    <Link href="/pillars" className="font-bold text-2xl tracking-tight text-white hover:opacity-80 transition-opacity">
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
