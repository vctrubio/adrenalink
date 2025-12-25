"use client";

import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { motion } from "framer-motion";

interface ClassboardSkeletonProps {
    error?: boolean;
}

export const ClassboardSkeleton = ({ error }: ClassboardSkeletonProps) => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-16"
        >
            {/* LARGE OUTLINE ICON */}
            <div className="text-foreground">
                <AdranlinkIcon size={450} />
            </div>

            {/* CATCHPHRASE / ERROR MESSAGE */}
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className={`font-bold tracking-[0.2em] text-xl uppercase text-center max-w-lg leading-relaxed ${error ? "text-red-500" : "text-muted-foreground/60"}`}
            >
                {error ? "Sorry, there has been a problem..." : "Managing your Lessons"}
            </motion.p>
        </motion.div>
    </div>
);