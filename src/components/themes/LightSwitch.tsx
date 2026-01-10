"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LightSwitch() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg bg-stone-200 border border-stone-300">
                <div className="w-8 h-12 bg-stone-100 rounded flex items-center justify-center">
                    <div className="w-5 h-6 bg-stone-400 rounded-sm" />
                </div>
            </div>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex flex-col items-center rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="Toggle theme"
        >
            {/* Light switch plate */}
            <div className="w-8 h-12 rounded flex items-center justify-center relative">
                {/* Switch toggle */}
                <div
                    className={`w-5 h-6 rounded-sm transition-all duration-300 cursor-pointer ${isDark ? "bg-stone-700 translate-y-2 shadow-inner" : "bg-stone-400 -translate-y-2 shadow-md"}`}
                >
                    {/* Switch nub */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-sm ${isDark ? "bg-stone-500 top-1" : "bg-stone-300 bottom-1"}`}
                    />
                </div>
            </div>
        </button>
    );
}
