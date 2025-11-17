"use client";

import { useRef, useEffect, useState } from "react";
import EventSettingController from "./EventSettingController";
import ExportSettingController from "./ExportSettingController";
import ClassboardBarChart from "./ClassboardBarChart";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";
import type { ControllerSettings as ControllerSettingsType, TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalStats } from "@/backend/ClassboardStats";
import StatsWithBulk from "./ClassboardStatsBulk";

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
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    controller: ControllerSettingsType;
    setController: (controller: ControllerSettingsType) => void;
    stats: GlobalStats;
    teacherQueues: TeacherQueue[];
    totalBookings: number;
}

export default function ClassboardController({ search, setSearch, selectedDate, setSelectedDate, controller, setController, stats, teacherQueues, totalBookings }: ClassboardControllerProps) {
    return (
        <div className="bg-card">
            <div className="p-6 space-y-6">
                <ClassboardBarChart stats={stats} totalBookings={totalBookings} />

                <div className="">
                    <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>

                <div className="border-t border-border pt-4">
                    <StatsWithBulk stats={stats} teacherQueues={teacherQueues} />
                </div>

                <div className="border-t border-border pt-4">
                    <EventSettingController controller={controller} onControllerChange={setController} />
                </div>

                <div className="border-t border-border pt-4">
                    <ExportSettingController selectedDate={selectedDate} teacherQueues={teacherQueues} />
                </div>
            </div>
        </div>
    );
}
