"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

export const SubDomainSkeleton = () => {
    useEffect(() => {
        // Force light mode
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
    }, []);

    return (
        <div className="light min-h-screen h-screen bg-[#f8f9fa] flex flex-col items-center p-4 md:p-8 overflow-hidden overscroll-none text-zinc-900">
            {/* Force preload of the mask image */}
            <div className="hidden">
                <Image src="/ADR.webp" alt="" width={1} height={1} priority />
            </div>

            {/* Main Portal Container Skeleton */}
            <div className="w-full max-w-7xl flex-1 bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
                {/* 1. Banner Section Skeleton - STAND OUT ICON */}
                <div className="relative w-full h-48 md:h-80 group shrink-0 bg-zinc-100 flex items-center justify-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.34, 1.56, 0.64, 1], // Playful bounce/pop
                        }}
                        className="z-10"
                    >
                        <Image src="/ADR.webp" alt="Adrenalink" width={160} height={160} priority className="drop-shadow-2xl" />
                    </motion.div>
                </div>

                {/* 2. Profile Info Bar Skeleton */}
                <div className="relative px-6 md:px-10 pb-8 bg-zinc-50 shrink-0 border-b border-zinc-100">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        {/* School Icon Skeleton */}
                        <div className="-mt-16 md:-mt-20 z-10 flex-shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-zinc-200 overflow-hidden shadow-xl animate-pulse" />
                        </div>

                        {/* Name & Categories Skeleton */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 md:pb-4 gap-4 w-full">
                            <div className="h-10 md:h-14 w-3/4 md:w-1/2 bg-zinc-200 rounded-xl animate-pulse" />

                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-6 w-20 bg-zinc-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Package Content Area Skeleton */}
                <div className="flex-1 bg-white/50 backdrop-blur-3xl overflow-hidden flex flex-col">
                    <div className="p-6 md:p-10 flex flex-col gap-10 h-full">
                        {/* Sport Selection Skeleton */}
                        <div className="w-full max-w-2xl mx-auto shrink-0 flex justify-center gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 w-32 bg-zinc-200 rounded-full animate-pulse" />
                            ))}
                        </div>

                        {/* Package Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="aspect-[4/5] bg-zinc-100 rounded-3xl animate-pulse border border-zinc-200/50 p-6 flex flex-col gap-4"
                                >
                                    <div className="w-full h-1/2 bg-zinc-200 rounded-2xl" />
                                    <div className="h-6 w-3/4 bg-zinc-200 rounded-lg" />
                                    <div className="h-4 w-1/2 bg-zinc-200 rounded-lg" />
                                    <div className="mt-auto h-12 w-full bg-zinc-200 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
