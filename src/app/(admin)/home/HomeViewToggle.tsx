"use client";

import { LayoutGrid, List, Grid3X3 } from "lucide-react";
import type { ViewMode } from "./HomePage";

interface HomeViewToggleProps {
    mode: ViewMode;
    setMode: (m: ViewMode) => void;
}

export function HomeViewToggle({ mode, setMode }: HomeViewToggleProps) {
    return (
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border w-fit">
            <button onClick={() => setMode("grouped")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "grouped" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid size={14} />
                <span>Grouped</span>
            </button>
            <button onClick={() => setMode("table")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "table" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <List size={14} />
                <span>Table</span>
            </button>
            <button onClick={() => setMode("calendar")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "calendar" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Grid3X3 size={14} />
                <span>Activity</span>
            </button>
        </div>
    );
}
