"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { TrendingUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { DailyLessonStats } from "../../../../backend/ClassboardStatistics";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";

export default function ClassboardHeaderStatsGrid({ stats }: { stats: DailyLessonStats }) {
    return (
        <div className="flex-1 min-w-[280px] rounded-2xl bg-card border border-zinc-200 dark:border-zinc-700 p-2">
            {/* Row 1: Students, Teachers, Lessons */}
            <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <HelmetIcon size={16} className="text-muted-foreground shrink-0" />
                    <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.3 }}>
                        Students
                    </motion.span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={stats.studentCount || 0} />
                    </span>
                </motion.div>
                
                <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.05 }}>
                    <HeadsetIcon size={16} className="text-muted-foreground shrink-0" />
                    <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.35 }}>
                        Teachers
                    </motion.span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={stats.teacherCount || 0} />
                    </span>
                </motion.div>
                
                <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
                    <FlagIcon size={16} className="text-muted-foreground shrink-0" />
                    <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.4 }}>
                        Events
                    </motion.span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={stats.eventCount || 0} />
                    </span>
                </motion.div>
            </div>

            {/* Horizontal divider with gap */}
            <div className="h-px bg-zinc-400 dark:bg-zinc-500 my-2 mx-2 opacity-30" />

            {/* Row 2: Duration, Commissions, Revenue */}
            <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
                    <DurationIcon size={16} className="text-muted-foreground shrink-0" />
                    <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.45 }}>
                        Duration
                    </motion.span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={stats.durationCount || 0} formatter={getHMDuration} />
                    </span>
                </motion.div>
                
                <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
                    <HandshakeIcon size={16} className="text-muted-foreground shrink-0" />
                    <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.5 }}>
                        Comm.
                    </motion.span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={stats.revenue.commission || 0} formatter={getCompactNumber} />
                    </span>
                </motion.div>
                
                <motion.div className="flex items-center justify-center gap-2 py-2 px-3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.25 }}>
                    {stats.revenue.profit > 0 ? (
                        <TrendingUp size={16} className="text-muted-foreground shrink-0" />
                    ) : stats.revenue.profit < 0 ? (
                        <TrendingDown size={16} className="text-muted-foreground shrink-0" />
                    ) : (
                        <TrendingUpDown size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <motion.span className="text-muted-foreground text-xs hidden lg:inline" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ duration: 0.2, delay: 0.55 }}>
                        Profit
                    </motion.span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={stats.revenue.profit || 0} formatter={getCompactNumber} />
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
