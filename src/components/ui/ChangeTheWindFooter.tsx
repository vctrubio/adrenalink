"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { SpinAdranalink } from "@/src/components/ui/SpinAdranalink";

interface ChangeTheWindFooterProps {
    showFooter: boolean;
    isStarting: boolean;
    onGetStarted?: () => void;
    variant?: "primary" | "secondary";
    extraActions?: React.ReactNode;
}

export function ChangeTheWindFooter({ 
    showFooter, 
    isStarting, 
    onGetStarted, 
    variant = "primary",
    extraActions
}: ChangeTheWindFooterProps) {
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    
    const accentTextClass = variant === "primary" ? "group-hover:text-primary" : "group-hover:text-secondary";

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{
                y: showFooter ? 0 : 100,
                opacity: showFooter ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50"
        >
            <div className="w-full backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto py-3 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <Link
                                href="/welcome"
                                onClick={onGetStarted}
                                onMouseEnter={() => setIsButtonHovered(true)}
                                onMouseLeave={() => setIsButtonHovered(false)}
                                className="px-6 py-3 rounded-full border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-3"
                            >
                                <SpinAdranalink isSpinning={isStarting || isButtonHovered} duration={isStarting ? 0.3 : 0.8} size={20} />
                                <span>Get Started</span>
                            </Link>

                            <Link 
                                href="/welcome"
                                className="cursor-pointer transition-all group flex items-center gap-3 text-muted-foreground hover:text-foreground"
                            >
                                <AdminIcon className={`w-5 h-5 transition-colors ${accentTextClass}`} />
                                <span className="font-medium hover:underline">Register as a School</span>
                            </Link>

                            {extraActions}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground text-sm">Change the wind</span>
                            <WindToggle />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}