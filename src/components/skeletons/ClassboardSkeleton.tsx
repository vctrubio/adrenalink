"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { ClassboardSports } from "./ClassboardSports";

interface ClassboardSkeletonProps {
    error?: boolean;
}

export const ClassboardSkeleton = ({ error }: ClassboardSkeletonProps) => {
    const credentials = useSchoolCredentials();

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
                    maskImage: 'url(/ADR.webp)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: 'url(/ADR.webp)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center w-full"
            >
                {/* TEXT CONTAINER */}
                <div className="flex flex-col items-center gap-6 w-full px-4 min-h-[140px]">
                    {error ? (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold tracking-[0.2em] text-xl uppercase text-center text-red-500"
                        >
                            Sorry, there has been a problem...
                        </motion.p>
                    ) : (
                        <>
                            {credentials?.name ? (
                                <>
                                    {/* SCHOOL NAME - Bigger Text */}
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="text-2xl font-semibold text-[#6b7280] tracking-wide"
                                    >
                                        {credentials.name}&apos;s School
                                    </motion.p>

                                    {/* SPORTS */}
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 1 }}
                                        className="w-full"
                                    >
                                        <ClassboardSports animate={true} />
                                    </motion.div>
                                </>
                            ) : (
                                /* PENDING STATE */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <p className="text-muted-foreground animate-pulse tracking-widest uppercase text-sm">
                                        Initializing School
                                    </p>
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
