"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import EventSettingController from "./EventSettingController";
import ExportSettingController from "./ExportSettingController";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";
import type { ControllerSettings as ControllerSettingsType, TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalStats } from "@/backend/ClassboardStats";
import ClassboardStatistics from "./ClassboardStatistics";

interface SearchInputProps {
    search: string;
    setSearch: (search: string) => void;
}

function SearchInput({ search, setSearch }: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (document.activeElement === inputRef.current) {
                    inputRef.current?.blur();
                } else {
                    inputRef.current?.focus();
                }
            }

            if (e.key === "Escape" && document.activeElement === inputRef.current) {
                e.preventDefault();
                inputRef.current?.blur();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search by student name..."
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
            {!isFocused && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">⌘K</div>}
        </div>
    );
}

interface ClassboardControllerProps {
    search: string;
    setSearch: (search: string) => void;
    controller: ControllerSettingsType;
    setController: (controller: ControllerSettingsType) => void;
    stats: GlobalStats;
    teacherQueues: TeacherQueue[];
    totalBookings: number;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function ClassboardController({ search, setSearch, controller, setController, stats, teacherQueues, totalBookings, isCollapsed, onToggleCollapse }: ClassboardControllerProps) {
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
                <div className={`transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
            </div>

            {/* Expandable Content */}
            {!isCollapsed && (
                <div className="overflow-hidden">
                    <div className="p-6 pt-0 space-y-6">
                        <div className="border-t border-border pt-6">
                            <ClassboardStatistics stats={stats} teacherQueues={teacherQueues} totalBookings={totalBookings} />
                        </div>

                        <div className="pt-1">
                            <EventSettingController controller={controller} onControllerChange={setController} />
                        </div>

                        <div className="pt-1">
                            <ExportSettingController selectedDate={""} teacherQueues={teacherQueues} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
