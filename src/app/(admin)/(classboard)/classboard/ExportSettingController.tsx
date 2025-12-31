"use client";

import { useState } from "react";
import { FileText, DollarSign } from "lucide-react";
import { DailyClassScheduleModal, PricingDailyClassScheduleModal } from "@/src/components/modals";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";

interface ExportSettingControllerProps {
    selectedDate: string;
    teacherQueues: TeacherQueue[];
}

export default function ExportSettingController({ selectedDate, teacherQueues }: ExportSettingControllerProps) {
    const [isDailyScheduleModalOpen, setIsDailyScheduleModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-3 w-full mx-auto justify-center">
                <button
                    onClick={() => setIsDailyScheduleModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Daily Schedule</span>
                </button>

                <button
                    onClick={() => setIsPricingModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Pricing Schedule</span>
                </button>
            </div>

            <DailyClassScheduleModal
                isOpen={isDailyScheduleModalOpen}
                onClose={() => setIsDailyScheduleModalOpen(false)}
                selectedDate={selectedDate}
                teacherQueues={teacherQueues}
            />

            <PricingDailyClassScheduleModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                selectedDate={selectedDate}
                teacherQueues={teacherQueues}
            />
        </>
    );
}
