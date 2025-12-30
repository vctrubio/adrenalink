"use client";

import { motion } from "framer-motion";

interface SchoolPageLayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
    isStarting: boolean;
    isNavigatingOther: boolean;
}

/**
 * Standardized high-fidelity layout wrapper for School pages
 * Static branding remains fixed, while the rest of the layout animates.
 */
export const SchoolPageLayout = ({ 
    children, 
    header, 
    footer,
    isStarting,
    isNavigatingOther
}: SchoolPageLayoutProps) => {
    const isExiting = isStarting || isNavigatingOther;

    return (
        <section className="py-32 bg-background min-h-screen text-foreground overflow-hidden">
            <div className="container mx-auto px-4 mb-32">
                <div className="max-w-6xl mx-auto relative">
                    {/* Header Container - Static branding inside, animated sub-content */}
                    <div className="mb-24">
                        {header}
                    </div>

                    {/* Content with entrance and exit animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={isExiting ? { opacity: 0, x: -100, filter: "blur(10px)" } : { opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </div>

            {footer}
        </section>
    );
};