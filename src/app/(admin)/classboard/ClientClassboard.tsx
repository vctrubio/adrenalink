"use client";

import { useState } from "react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import ClassboardDateHeader from "@/src/components/classboard/ClassboardDateHeader";
import ClassboardContentHeader from "@/src/components/classboard/ClassboardContentHeader";
import ClassboardContentBoard from "./ClassboardContentBoard";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardRealtimeSync from "./ClassboardRealtimeSync";

type ContentHeaderViewType = "/" | "config" | "gap" | "lesson" | "admin" | "update";

export default function ClientClassboard() {
    const { mounted, error } = useClassboardContext();
    const credentials = useSchoolCredentials();

    if (!mounted) {
        return <ClassboardSkeleton />;
    }

    if (error) {
        return <ClassboardSkeleton error={true} errorMessage={error} />;
    }

    if (!credentials?.timezone) {
        return (
            <ClassboardSkeleton
                error={true}
                errorMessage={`No TimeZone Configuration found for ${credentials?.name || "School"}. Please refresh or update school settings.`}
            />
        );
    }

    return (
        <ClassboardRealtimeSync>
            <ClassboardContent />
        </ClassboardRealtimeSync>
    );
}

function ClassboardContent() {
    const [contentHeaderViewType, setContentHeaderViewType] = useState<ContentHeaderViewType>("/");

    // Toggle view type - clicking a button again resets to default "/"
    const toggleContentView = (viewType: ContentHeaderViewType) => {
        setContentHeaderViewType(contentHeaderViewType === viewType ? "/" : viewType);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-col lg:flex-row items-stretch gap-4 pb-4 mx-auto w-full max-w-7xl">
                <div className="flex-1 ">
                    <ClassboardDateHeader contentViewType={contentHeaderViewType} onContentViewChange={toggleContentView} />
                </div>
                <div className="flex-1">
                    <ClassboardContentHeader viewType={contentHeaderViewType} />
                </div>
            </div>

            <ClassboardContentBoard />

        </div>
    );
}
