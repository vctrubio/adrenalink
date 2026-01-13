"use client";

import { motion } from "framer-motion";
import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";

export default function ClassboardContentBoard() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="flex-1 p-4 overflow-y-auto min-h-0 flex flex-col max-h-[80vh] "
        >
            <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
                {/* Left Column: Students */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
                    className="w-full xl:w-[400px] flex-shrink-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300 relative bg-card/30"
                >
                    <StudentClassDaily />
                </motion.div>

                {/* Right Column: Teachers */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
                    className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300"
                >
                    <TeacherClassDaily />
                </motion.div>
            </div>
        </motion.div>
    );
}
