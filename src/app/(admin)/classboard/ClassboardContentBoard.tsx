"use client";

import StudentClassDaily from "./StudentClassDaily";
import TeacherClassDaily from "./TeacherClassDaily";

export default function ClassboardContentBoard() {
    return (
        <div className="flex-1 p-4 overflow-y-auto min-h-0 flex flex-col max-h-[80vh] ">
            <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
                {/* Left Column: Students */}
                <div className="w-full xl:w-[400px] flex-shrink-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300 relative bg-card/30">
                    <StudentClassDaily />
                </div>

                {/* Right Column: Teachers */}
                <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-300">
                    <TeacherClassDaily />
                </div>
            </div>
        </div>
    );
}
