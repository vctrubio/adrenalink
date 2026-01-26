"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface UserWelcomeProps {
    firstName: string;
    lastName: string;
    schoolName?: string;
    children?: ReactNode;
}

export default function UserWelcome({ firstName, lastName, schoolName, children }: UserWelcomeProps) {
    return (
        <div className="flex flex-col">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-2 border-b border-border/50"
            >
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-4xl md:text-5xl font-black tracking-tight text-foreground"
                >
                    Hello {firstName} {lastName}
                </motion.h2>
                {schoolName && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        className="text-xl md:text-2xl text-muted-foreground font-medium"
                    >
                        Welcome to <span className="border-b-2 border-foreground/30 pb-1">{schoolName}</span>
                    </motion.p>
                )}
            </motion.div>

            {/* Children Content */}
            {children && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
                    {children}
                </motion.div>
            )}
        </div>
    );
}
