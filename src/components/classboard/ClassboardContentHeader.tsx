"use client";

import ClassboardFlagSettings from "@/src/components/classboard/ClassboardFlagSettings";
import ClassboardGroupSettings from "@/src/components/classboard/ClassboardGroupSettings";
import ClassboardConfigSettings from "@/src/components/classboard/ClassboardConfigSettings";
import ClassboardShareSettings from "@/src/components/classboard/ClassboardShareSettings";
import ClassboardHeaderStatsGrid from "@/src/app/(admin)/classboard/ClassboardHeaderStatsGrid";
import EventStatusSummary from "@/src/components/classboard/EventStatusSummary";
import { motion } from "framer-motion";

type ContentHeaderViewType = "/" | "config" | "gap" | "lesson" | "share" | "update";

interface ClassboardContentHeaderProps {
    viewType: ContentHeaderViewType;
}

export default function ClassboardContentHeader({ viewType }: ClassboardContentHeaderProps) {
    const renderContent = () => {
        switch (viewType) {
            case "/":
                return <ClassboardHeaderStatsGrid />;

            case "config":
                return <ClassboardConfigSettings />;

            case "gap":
                return <ClassboardGroupSettings />;

            case "lesson":
                return <ClassboardFlagSettings />;

            case "share":
                return <ClassboardShareSettings />;

            case "update":
                return <EventStatusSummary />;

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="flex-1 min-w-0 border border-border/30 rounded-lg overflow-hidden h-full min-h-32 flex flex-col backdrop-blur-sm shadow-sm select-none "
        >
            {renderContent()}
        </motion.div>
    );
}
