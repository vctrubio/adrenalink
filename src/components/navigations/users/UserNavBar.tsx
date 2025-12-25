"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import UserNavDropdown from "./UserNavDropdown";
import UserHeader from "./UserHeader";
import UserTabs from "./UserTabs";

interface UserNavBarProps {
    schoolUsername?: string;
    userRole: "student" | "teacher" | null;
    userId?: string;
    firstName?: string;
    lastName?: string;
}

const LeftSection = () => <div className="flex-1" />;

const CenterSection = ({ schoolUsername }: { schoolUsername?: string }) => (
    <div className="flex flex-1 items-center justify-center">
        <h1 className="text-2xl font-bold uppercase">
            <span className="px-4 py-2 rounded-lg">{schoolUsername || "Adrenalink"}</span>
        </h1>
    </div>
);

const RightSection = ({ userRole, userId }: { userRole: "student" | "teacher" | null; userId?: string }) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

    return (
        <div className="flex-1 flex items-center justify-end gap-2">
            <button
                onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
                aria-label="Toggle theme"
            >
                {mounted && (isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </button>
            {userRole && <UserNavDropdown role={userRole} userId={userId} />}
        </div>
    );
};

export default function UserNavBar({ schoolUsername, userRole, userId, firstName, lastName }: UserNavBarProps) {
    return (
        <>
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full bg-facebook border-b border-facebook shadow-sm">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
                    <LeftSection />
                    <CenterSection schoolUsername={schoolUsername} />
                    <RightSection userRole={userRole} userId={userId} />
                </div>
            </header>

            {/* User Header and Tabs (only show if userId is provided) */}
            {userId && firstName && lastName && userRole && (
                <div>
                    <UserHeader firstName={firstName} lastName={lastName} />
                    <div className="container mx-auto px-6 py-6">
                        <UserTabs userId={userId} role={userRole} />
                    </div>
                </div>
            )}
        </>
    );
}
