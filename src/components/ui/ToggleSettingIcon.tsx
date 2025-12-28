"use client";

import { Settings } from "lucide-react";

interface ToggleSettingIconProps {
    isOpen: boolean;
    onClick: () => void;
}

export default function ToggleSettingIcon({ isOpen, onClick }: ToggleSettingIconProps) {
    return (
        <button
            onClick={onClick}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
            <Settings size={18} className={`text-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
        </button>
    );
}
