"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const SPORTS = [
    { id: "wingfoiling", label: "Wing Foiling", image: "/categories/wing.webp" },
    { id: "windsurfing", label: "Windsurfing", image: "/categories/wind.webp" },
    { id: "kitesurfing", label: "Kitesurfing", image: "/categories/kite.webp" },
];

interface ClassboardSportsProps {
    animate?: boolean;
    freezeAtCategory?: number;
}

export function ClassboardSports({ animate = false, freezeAtCategory }: ClassboardSportsProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!animate) {
            setActiveIndex(freezeAtCategory ?? null);
            return;
        }

        // Random start index
        setActiveIndex(Math.floor(Math.random() * SPORTS.length));

        const interval = setInterval(() => {
            setActiveIndex((current) => {
                if (current === null) return 0;
                // Cycle to next, or random? User said "random index that will animate... like a guessing game"
                // Let's pick a random one different from current
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * SPORTS.length);
                } while (nextIndex === current && SPORTS.length > 1);
                return nextIndex;
            });
        }, 2000); // Change every 2 seconds

        return () => clearInterval(interval);
    }, [animate]);

    return (
        <div className="w-full max-w-md mx-auto h-[80px]">
            <div className="flex flex-row gap-3 h-full items-stretch justify-center">
                {SPORTS.map((sport, index) => {
                    const isActive = activeIndex === index;

                    return (
                        <motion.div
                            key={sport.id}
                            layout
                            initial={{ flex: 1 }}
                            animate={{
                                flex: isActive ? 3 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`relative rounded-2xl overflow-hidden border transition-all duration-500 flex items-center justify-center gap-2
                                ${isActive 
                                    ? "bg-secondary/10 border-secondary shadow-sm" 
                                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                                }
                            `}
                        >
                            <motion.div
                                layout="position"
                                className="relative flex-shrink-0"
                            >
                                <Image
                                    src={sport.image}
                                    alt={sport.label}
                                    width={isActive ? 40 : 32}
                                    height={isActive ? 40 : 32}
                                    className={`object-contain transition-all duration-300 dark:invert ${isActive ? "opacity-100" : "opacity-40 grayscale"}`}
                                />
                            </motion.div>

                            {isActive && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm font-semibold text-secondary whitespace-nowrap overflow-hidden"
                                >
                                    {sport.label}
                                </motion.span>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
