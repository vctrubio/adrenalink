"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface RegisterFormLayoutProps {
    controller: ReactNode;
    form: ReactNode;
}

const formAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.15, ease: "easeOut" },
};

export function RegisterFormLayout({ controller, form }: RegisterFormLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <div className="p-4 space-y-4">
                    {controller}
                    <motion.div key={pathname} {...formAnimation} className="bg-card rounded-lg border border-border shadow-sm">
                        <div className="p-6">{form}</div>
                    </motion.div>
                    <div className="h-24" />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:fixed lg:inset-0 lg:top-16 lg:overflow-hidden">
                <div className="max-w-7xl mx-auto w-full h-full flex gap-8 p-8">
                    {/* Controller Sidebar - Fixed, Scrollable if needed */}
                    <aside className="w-1/3 flex-shrink-0 h-full overflow-y-auto">
                        {controller}
                    </aside>

                    {/* Form Content - Scrollable */}
                    <div className="flex-1 h-full overflow-y-auto">
                        <motion.div key={pathname} {...formAnimation} className="space-y-6">
                            {form}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
