"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

function NoCredentialsHeader() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleThemeToggle = () => {
        setIsSpinning(true);
        setTheme(isDarkMode ? "light" : "dark");
        setTimeout(() => setIsSpinning(false), 600);
    };

    // Show fallback during SSR/hydration
    if (!mounted) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleThemeToggle}
                        className="p-6 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer bg-card/50 border-2 border-border hover:border-primary backdrop-blur-sm hover:shadow-xl"
                        title="Toggle theme"
                    >
                        <AdranlinkIcon className="w-20 h-20 transition-all duration-600 text-primary" size={80} />
                    </button>
                </div>

                <div>
                    <h1 className="text-6xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        ⚠️
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">What were you doing?</h2>
                    <p className="text-lg md:text-xl text-muted-foreground">
                        We couldn&apos;t find your school credentials. Please make sure you&apos;re accessing the correct domain.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleThemeToggle}
                    className={`p-6 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${
                        isDarkMode
                            ? "bg-card/50 border-2 border-border hover:border-primary"
                            : "bg-card/80 border-2 border-border hover:border-primary"
                    } backdrop-blur-sm hover:shadow-xl`}
                    title="Toggle theme"
                >
                    <AdranlinkIcon
                        size={80}
                        className={`w-20 h-20 transition-all duration-600 text-primary ${isSpinning ? "animate-spin" : ""}`}
                    />
                </button>
            </div>

            <div>
                <h1 className="text-6xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    ⚠️
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">What were you doing?</h2>
                <p className="text-lg md:text-xl text-muted-foreground">
                    We couldn&apos;t find your school credentials. Please make sure you&apos;re accessing the correct domain.
                </p>
            </div>
        </div>
    );
}

export default function NoCredentials() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto">
                <NoCredentialsHeader />

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                    <Link
                        href="/discover"
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
                    >
                        Discover Schools
                    </Link>
                    <a
                        href="https://adrenalink.tech"
                        className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors text-center"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
