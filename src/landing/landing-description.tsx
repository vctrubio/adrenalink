"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";

const ROLES = [
    { id: "admin", label: "Admin", icon: AdminIcon },
    { id: "student", label: "Student", icon: HelmetIcon },
    { id: "teacher", label: "Teacher", icon: HeadsetIcon },
];

export function LandingDescription() {
    const [hoveredRole, setHoveredRole] = useState<string | null>(null);

    const handleRoleClick = (role: string) => {
        console.log(`Selected role: ${role}`);
    };

    return (
        <section className="h-screen snap-start relative overflow-hidden bg-sky-900">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/wave-wide.jpg"
                position="absolute"
                overlay="linear-gradient(to bottom, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 8%, rgba(15, 23, 42, 0.3) 15%, transparent 25%, transparent 75%, rgba(0, 0, 0, 1) 100%)"
                priority
            />

            {/* Photo Credit */}
            <Link
                href="https://unsplash.com/@kristapsungurs"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm group"
            >
                <Camera className="w-4 h-4" />
                <span className="text-xs font-medium">Kristaps Ungurs</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 h-full flex flex-col items-center justify-center px-4"
            >
                <div className="w-full max-w-5xl space-y-12 text-center">
                    {/* Join Forces Heading */}
                    <div className="space-y-6 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <AdranlinkIcon size={120} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                        </motion.div>
                        <div className="space-y-2">
                            <h2 className="text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
                                Join Forces
                            </h2>
                            <p className="text-lg text-white/60 font-medium tracking-wide">
                                Who are you?
                            </p>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="flex flex-col md:flex-row gap-4 h-[300px] md:h-[180px] w-full items-stretch justify-center">
                        {ROLES.map((role) => {
                            const isHovered = hoveredRole === role.id;
                            const Icon = role.icon;

                            return (
                                <motion.button
                                    key={role.id}
                                    layout
                                    onClick={() => handleRoleClick(role.id)}
                                    onHoverStart={() => setHoveredRole(role.id)}
                                    onHoverEnd={() => setHoveredRole(null)}
                                    className={`relative rounded-3xl overflow-hidden border transition-colors duration-300 flex flex-col items-center justify-center gap-3 ${
                                        isHovered
                                            ? "bg-white/20 border-white/60 z-10"
                                            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                                    }`}
                                    initial={{ flex: 1 }}
                                    animate={{
                                        flex: isHovered ? 2 : 1,
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    <motion.div
                                        layout="position"
                                        animate={{
                                            scale: isHovered ? 1.1 : 1,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <Icon size={isHovered ? 40 : 32} className={isHovered ? "text-white" : "text-current"} />
                                    </motion.div>
                                    
                                    <motion.span
                                        layout="position"
                                        className={`text-lg font-medium tracking-wide ${isHovered ? "text-white" : "text-current"}`}
                                    >
                                        {role.label}
                                    </motion.span>
                                    
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-4 text-xs text-white/80 font-medium px-4"
                                        >
                                            Click to continue
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}