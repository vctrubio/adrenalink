"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedEntityNameProps {
    name: string;
    isLoading?: boolean;
}

const fadeSlide = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const AnimatedEntityName = memo(function AnimatedEntityName({ name, isLoading = false }: AnimatedEntityNameProps) {
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="skeleton-name"
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="h-8 w-32 sm:w-40 bg-muted/50 rounded-lg animate-pulse"
                />
            ) : (
                <motion.h1
                    key={`name-${name}`}
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold text-foreground"
                >
                    {name}
                </motion.h1>
            )}
        </AnimatePresence>
    );
});

