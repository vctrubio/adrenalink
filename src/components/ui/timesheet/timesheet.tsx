"use client";

import { type ReactNode } from "react";

type TimesheetProps = {
    children: ReactNode;
};

export function Timesheet({ children }: TimesheetProps) {
    return (
        <div className="rounded-2xl bg-slate-900/80 text-white overflow-hidden border border-white/10">
            {children}
        </div>
    );
}
