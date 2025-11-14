"use client";

import { useRef, useEffect, useState } from "react";
import ControllerSettings from "./ControllerSettings";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";
import type { ControllerSettings as ControllerSettingsType } from "@/backend/TeacherQueue";
import type { GlobalStats } from "@/backend/ClassboardStats";
import { getPrettyDuration } from "@/getters/duration-getter";

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
            {!isFocused && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    ⌘K
                </div>
            )}
        </div>
    );
}


interface StatsDisplayProps {
    stats: GlobalStats;
}

function StatsDisplay({ stats }: StatsDisplayProps) {
    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Today Stats</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-muted-foreground">Teachers:</span>
                    <p className="font-medium">{stats.teacherCount}</p>
                </div>
                <div>
                    <span className="text-muted-foreground">Students:</span>
                    <p className="font-medium">{stats.totalStudents}</p>
                </div>
                <div>
                    <span className="text-muted-foreground">Lessons:</span>
                    <p className="font-medium">{stats.totalLessons}</p>
                </div>
                <div>
                    <span className="text-muted-foreground">Events:</span>
                    <p className={`font-medium ${stats.isComplete ? "text-green-600" : "text-orange-600"}`}>
                        {stats.totalEvents} / {stats.totalLessons}
                    </p>
                </div>
                <div>
                    <span className="text-muted-foreground">Hours:</span>
                    <p className="font-medium">{getPrettyDuration(stats.totalHours * 60)}</p>
                </div>
                <div>
                    <span className="text-muted-foreground">Completion:</span>
                    <p className={`font-medium ${stats.isComplete ? "text-green-600" : "text-orange-600"}`}>
                        {stats.completionPercentage}%
                    </p>
                </div>
            </div>
            <div className="pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Earnings</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Teacher:</span>
                        <span className="font-medium">€{stats.totalEarnings.teacher.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">School:</span>
                        <span className="font-medium">€{stats.totalEarnings.school.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">€{stats.totalEarnings.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
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
}

export default function ClassboardController({
    search,
    setSearch,
    selectedDate,
    setSelectedDate,
    controller,
    setController,
    stats,
}: ClassboardControllerProps) {
    return (
        <div className="lg:w-80 w-full p-4 border border-border rounded-md bg-muted/20">
            <div className="space-y-4">
                <SearchInput search={search} setSearch={setSearch} />

                <div className="border-t border-border pt-4">
                    <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>

                <div className="border-t border-border pt-4">
                    <ControllerSettings controller={controller} onControllerChange={setController} />
                </div>

                <div className="border-t border-border pt-4">
                    <StatsDisplay stats={stats} />
                </div>
            </div>
        </div>
    );
}
