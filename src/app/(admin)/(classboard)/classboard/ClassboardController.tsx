"use client";

import { ChevronUp } from "lucide-react";
import EventSettingController from "./EventSettingController";
import type { ControllerSettings as ControllerSettingsType } from "@/backend/TeacherQueue";
import AVerticalShape from "@/public/shapes/AVerticalShape";

interface ClassboardControllerProps {
    controller: ControllerSettingsType;
    setController: (controller: ControllerSettingsType) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function ClassboardController({
    controller,
    setController,
    isCollapsed,
    onToggleCollapse,
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
                    <div className="p-6 pt-0">
                        <div className="border-t border-border pt-6">
                            <EventSettingController controller={controller} onControllerChange={setController} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
