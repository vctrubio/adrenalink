"use client";

import { useMemo, useRef, useEffect, useState, ReactNode } from "react";
import Image from "next/image";
import { DATABOARD_DATE_FILTERS, DATABOARD_DATE_GROUPS } from "@/config/databoard";
import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";

interface SearchInputProps {
    search: string;
    setSearch: (search: string) => void;
    icon: ReactNode;
    studentCount: number;
    entityColor: string;
}

const SearchInput = ({ search, setSearch, icon, studentCount, entityColor }: SearchInputProps) => {
    const focusRingColor = useMemo(() => entityColor.replace("text-", "ring-"), [entityColor]);
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {icon}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search..."
                className={`w-full h-10 rounded-md border border-input bg-background pl-11 pr-20 text-sm focus:outline-none focus:ring-2 ${focusRingColor} transition-colors`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <div className={`text-sm font-bold ${entityColor}`}>
                    {studentCount}
                </div>
                {!isFocused && (
                    <Image
                        src="/hotkeys/CmdK.svg"
                        alt="⌘K"
                        width={32}
                        height={20}
                        className="opacity-60"
                    />
                )}
            </div>
        </div>
    );
};

interface FilterSelectProps {
    filter: DataboardFilterByDate;
    setFilter: (filter: DataboardFilterByDate) => void;
}

const FilterSelect = ({ filter, setFilter }: FilterSelectProps) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Filter by</label>
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as DataboardFilterByDate)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {DATABOARD_DATE_FILTERS.map(filterOption => (
                    <option key={filterOption} value={filterOption}>
                        {filterOption}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface GroupSelectProps {
    group: DataboardGroupByDate;
    setGroup: (group: DataboardGroupByDate) => void;
}

const GroupSelect = ({ group, setGroup }: GroupSelectProps) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Group by</label>
            <select
                value={group}
                onChange={(e) => setGroup(e.target.value as DataboardGroupByDate)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {DATABOARD_DATE_GROUPS.map(groupOption => (
                    <option key={groupOption} value={groupOption}>
                        {groupOption}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface DataboardControllerProps {
    search: string;
    setSearch: (search: string) => void;
    filter: DataboardFilterByDate;
    setFilter: (filter: DataboardFilterByDate) => void;
    group: DataboardGroupByDate;
    setGroup: (group: DataboardGroupByDate) => void;
    icon: ReactNode;
    studentCount: number;
    entityColor: string;
}

export const DataboardController = ({ search, setSearch, filter, setFilter, group, setGroup, icon, studentCount, entityColor }: DataboardControllerProps) => {
    return (
        <div className="lg:w-64 w-full p-4 border border-border rounded-md bg-muted/20">
            <div className="space-y-4">
                <SearchInput search={search} setSearch={setSearch} icon={icon} studentCount={studentCount} entityColor={entityColor} />

                <div className="border-t border-border pt-4 space-y-4">
                    <FilterSelect filter={filter} setFilter={setFilter} />
                    <GroupSelect group={group} setGroup={setGroup} />
                </div>
            </div>
        </div>
    );
};
