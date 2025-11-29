"use client";
import { Plus, Bell, Sun, Moon } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const ActionButton = ({ icon: Icon, children, onClick }: { icon?: React.ElementType; children?: React.ReactNode; onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
    >
        {Icon && <Icon className="h-5 w-5" />}
        {children}
    </button>
);

export const NavRight = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');

    return (
        <div className="flex items-center gap-2">
            <ActionButton icon={Plus} />
            <ActionButton icon={Bell} />
            <ActionButton
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                icon={mounted ? (isDarkMode ? Sun : Moon) : undefined}
            />
            <ActionButton>
                <AdminIcon className="h-6 w-6" />
            </ActionButton>
        </div>
    );
};
