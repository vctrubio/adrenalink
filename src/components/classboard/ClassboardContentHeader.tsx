"use client";

import ClassboardFlagSettings from "@/src/components/classboard/ClassboardFlagSettings";
import ClassboardGroupSettings from "@/src/components/classboard/ClassboardGroupSettings";
import ClassboardConfigSettings from "@/src/components/classboard/ClassboardConfigSettings";
import ClassboardShareSettings from "@/src/components/classboard/ClassboardShareSettings";
import ClassboardHeaderStatsGrid from "@/src/app/(admin)/classboard/ClassboardHeaderStatsGrid";
import EventStatusSummary from "@/src/components/classboard/EventStatusSummary";

type ContentHeaderViewType = "/" | "config" | "gap" | "lesson" | "admin" | "update";

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

            case "admin":
                return <ClassboardShareSettings />;

            case "update":
                return <EventStatusSummary />;

            default:
                return null;
        }
    };

    return (
        <div className="flex-1 min-w-0 border border-border/30 rounded-lg overflow-hidden h-full min-h-32 flex flex-col backdrop-blur-sm shadow-sm select-none ">
            {renderContent()}
        </div>
    );
}
