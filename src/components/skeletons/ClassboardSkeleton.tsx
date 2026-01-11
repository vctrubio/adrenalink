"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { ClassboardSports } from "./ClassboardSports";

interface ClassboardSkeletonProps {
    error?: boolean;
    errorMessage?: string | null;
}

export const ClassboardSkeleton = ({ error, errorMessage }: ClassboardSkeletonProps) => {
    const credentials = useSchoolCredentials();
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Track loading timeout - show refresh prompt after 8 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingTimeout(true);
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    // Freeze at a random category when error occurs
    const frozenCategory = useMemo(() => {
        return error ? Math.floor(Math.random() * 3) : undefined;
    }, [error]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
            {/* Force preload of the mask image */}
            <div className="hidden">
                <Image src="/ADR.webp" alt="" width={1} height={1} priority />
            </div>

            {/* LARGE OUTLINE ICON - Creative Fast Fade In */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Custom easeOutQuint-ish
                className="w-[350px] h-[350px] bg-foreground dark:bg-secondary transition-colors duration-300 mb-12"
                style={{
                    maskImage: "url(/ADR.webp)",
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskImage: "url(/ADR.webp)",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center w-full"
            >
                {/* TEXT CONTAINER */}
                <div className="flex flex-col items-center gap-6 w-full px-4 min-h-[100px]">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                            <p className="text-lg text-center text-muted-foreground">We couldn&apos;t find you</p>
                            {credentials?.username && <p className="font-semibold text-xl text-foreground">@{credentials.username}</p>}
                            {errorMessage && (
                                <p className="text-xs text-center text-muted-foreground/60 max-w-md px-4 mt-2">{errorMessage}</p>
                            )}
                        </motion.div>
                    )}

                    {!error && credentials?.name && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl schools-name tracking-wide"
                        >
                            {/* {credentials.name}&apos;s School */}
                            {credentials.name}
                        </motion.p>
                    )}

                    {!error && !credentials?.name && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-muted-foreground animate-pulse tracking-widest uppercase text-sm"
                        >
                            Checking the wind...
                        </motion.p>
                    )}

                    {loadingTimeout && !error && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 rounded-lg bg-secondary/10 border border-secondary text-secondary hover:bg-secondary/20 transition-all duration-300 active:scale-95 text-sm font-medium"
                        >
                            Taking longer than expected - Click to refresh
                        </motion.button>
                    )}
                </div>

                {/* SPORTS - Always shown */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="w-full"
                >
                    <ClassboardSports animate={!error} freezeAtCategory={frozenCategory} />
                </motion.div>
            </motion.div>
        </div>
    );
};
