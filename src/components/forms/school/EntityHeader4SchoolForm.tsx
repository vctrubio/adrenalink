"use client";

import { motion } from "framer-motion";

interface EntityHeader4SchoolFormProps {
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    entityTitle: string;
    isFormReady?: boolean;
}

export function EntityHeader4SchoolForm({ icon: Icon, color, entityTitle, isFormReady = true }: EntityHeader4SchoolFormProps) {
    return (
        <div className="flex items-center gap-3">
            {Icon && (
                <div
                    className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                    style={{
                        color: isFormReady ? color : "#94a3b8",
                    }}
                >
                    <Icon className="w-10 h-10 transition-all duration-300" />
                </div>
            )}
            <motion.h2
                className="text-2xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {entityTitle}
            </motion.h2>
        </div>
    );
}
