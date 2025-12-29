"use client";

import { motion } from "framer-motion";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { ClassboardSports } from "./ClassboardSports";

interface ClassboardSkeletonProps {
    error?: boolean;
}

export const ClassboardSkeleton = ({ error }: ClassboardSkeletonProps) => {
    const credentials = useSchoolCredentials();

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-12"
            >
                {/* LARGE OUTLINE ICON */}
                <div 
                    className="w-[350px] h-[350px] bg-foreground dark:bg-secondary transition-colors duration-300"
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

                {/* TEXT CONTAINER */}
                <div className="flex flex-col items-center gap-6 w-full px-4">
                    {/* SCHOOL NAME - Bigger Text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-2xl font-semibold text-foreground tracking-wide"
                    >
                        {credentials?.name ? `-- ${credentials.name} --` : ""}
                    </motion.p>

                    {/* SPORTS / ERROR MESSAGE */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="w-full"
                    >
                        {error ? (
                            <p className="font-bold tracking-[0.2em] text-xl uppercase text-center text-red-500">
                                Sorry, there has been a problem...
                            </p>
                        ) : (
                            <ClassboardSports animate={true} />
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
