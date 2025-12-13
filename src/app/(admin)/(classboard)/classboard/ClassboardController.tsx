"use client";

import { ChevronUp } from "lucide-react";
import EventSettingController from "./EventSettingController";
import ExportSettingController from "./ExportSettingController";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";
import type { ControllerSettings as ControllerSettingsType, TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalStats } from "@/backend/ClassboardStats";
import ClassboardStatistics from "./ClassboardStatistics";
import AVerticalShape from "@/public/shapes/AVerticalShape";

interface ClassboardControllerProps {
    controller: ControllerSettingsType;
    setController: (controller: ControllerSettingsType) => void;
    stats: GlobalStats;
    teacherQueues: TeacherQueue[];
    totalBookings: number;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export default function ClassboardController({
    controller,
    setController,
    stats,
    teacherQueues,
    totalBookings,
    isCollapsed,
    onToggleCollapse,
    selectedDate,
    onDateChange,
}: ClassboardControllerProps) {
    return (
        <div className="bg-card border-b border-border">
            {/* Collapsed Header */}
            <div
                className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-foreground">Classboard Settings</h2>
                </div>
                <div className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}>
                    <AVerticalShape className="text-muted-foreground" />
                </div>
            </div>

            {/* Expandable Content */}
            {!isCollapsed && (
                <div className="overflow-hidden">
                    <div className="p-6 pt-0 space-y-6">
                        <div className="border-t border-border pt-6">
                            <h3 className="text-base font-semibold text-foreground/80 uppercase tracking-wider mb-4">Date</h3>
                            <SingleDatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
                        </div>

                        <div className="border-t border-border pt-6">
                            <ClassboardStatistics stats={stats} teacherQueues={teacherQueues} totalBookings={totalBookings} />
                        </div>

                        <div className="pt-1">
                            <EventSettingController controller={controller} onControllerChange={setController} />
                        </div>

                        <div className="pt-1">
                            <ExportSettingController selectedDate={selectedDate} teacherQueues={teacherQueues} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
