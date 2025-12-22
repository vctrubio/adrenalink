"use client";

import { ClassboardDatePicker } from "@/src/components/pickers/ClassboardDatePicker";

interface ClassboardHeaderProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export default function ClassboardHeader({ selectedDate, onDateChange }: ClassboardHeaderProps) {
    return (
        <div className="flex-none bg-card rounded-xl shadow-sm p-6">
            <ClassboardDatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
    );
}
