"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { Sun, Moon } from "lucide-react";

export default function ToggleTheme() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-3 p-2">
                <Sun size={18} className="text-gray-400" />
                <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                <Moon size={18} className="text-gray-400" />
            </div>
        );
    }

    const isDark = theme === "dark";

    return (
        <div className="flex items-center gap-3">
            <Switch
                checked={isDark}
                onChange={(checked) => setTheme(checked ? "dark" : "light")}
                className={`${isDark ? "bg-gray-700" : "bg-gray-400"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
                <span
                    className={`${isDark ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </Switch>
        </div>
    );
}
