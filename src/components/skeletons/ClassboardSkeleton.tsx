"use client";

import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { motion } from "framer-motion";

export const ClassboardSkeleton = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0f1e] z-50">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-12"
        >
            {/* LARGE WHITE OUTLINE ICON */}
            <div className="text-white">
                <AdranlinkIcon size={450} />
            </div>

            {/* CATCHPHRASE BELOW */}
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-white font-medium tracking-[0.3em] text-xs uppercase"
            >
                Managing your Lessons
            </motion.p>
        </motion.div>
    </div>
);
