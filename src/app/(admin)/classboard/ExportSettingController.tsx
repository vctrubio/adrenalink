"use client";

import { useState } from "react";
import { FileText, DollarSign } from "lucide-react";
import { DailyClassScheduleModal, PricingDailyClassScheduleModal } from "@/src/components/modals";
import type { TeacherQueue } from "@/backend/TeacherQueue";

interface ExportSettingControllerProps {
    selectedDate: string;
    teacherQueues: TeacherQueue[];
}

export default function ExportSettingController({ selectedDate, teacherQueues }: ExportSettingControllerProps) {
    const [isDailyScheduleModalOpen, setIsDailyScheduleModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsDailyScheduleModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Daily Schedule</span>
                </button>

                <button
                    onClick={() => setIsPricingModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
