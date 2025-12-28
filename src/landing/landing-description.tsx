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
import WindsurfingIcon from "@/public/appSvgs/WindsurfingIcon.jsx";
import KitesurfingIcon from "@/public/appSvgs/KitesurfingIcon.jsx";
import WingFoilingIcon from "@/public/appSvgs/WingFoilingIcon.jsx";

const USER_ROLES = [
    { id: "admin", label: "Admin", icon: AdminIcon },
    { id: "student", label: "Student", icon: HelmetIcon },
    { id: "teacher", label: "Teacher", icon: HeadsetIcon },
];

const SPORTS = [
    { id: "windsurfing", label: "Windsurfing", icon: WindsurfingIcon },
    { id: "kitesurfing", label: "Kitesurfing", icon: KitesurfingIcon },
    { id: "wingfoiling", label: "Wing Foiling", icon: WingFoilingIcon },
];

export function LandingDescription() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string | null>(null);

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

                    {/* User Role Selection */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 md:flex md:flex-row gap-4 h-[100px] md:h-[140px] w-full items-stretch justify-center">
                            {USER_ROLES.map((role) => {
                                const isSelected = selectedRole === role.id;
                                const Icon = role.icon;

                                return (
                                    <motion.div
                                        key={role.id}
                                        layout
                                        initial={{ flex: 1 }}
                                        animate={{
                                            flex: isSelected ? 2 : 1,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <motion.button
                                            onClick={() => setSelectedRole(isSelected ? null : role.id)}
                                            className={`relative rounded-3xl overflow-hidden border transition-colors duration-300 flex flex-col items-center justify-center gap-3 w-full h-full ${
                                                isSelected
                                                    ? "bg-white/20 border-white/60 z-10"
                                                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/15 hover:border-white/40"
                                            }`}
                                        >
                                            <motion.div
                                                layout="position"
                                                animate={{
                                                    scale: isSelected ? 1.2 : 1,
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            >
                                                <Icon size={isSelected ? 48 : 40} className={isSelected ? "text-white" : "text-white/60"} />
                                            </motion.div>

                                            <motion.span
                                                layout="position"
                                                className={`hidden md:block text-base font-medium tracking-wide ${isSelected ? "text-white" : "text-white/60"}`}
                                            >
                                                {role.label}
                                            </motion.span>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Sport Selection */}
                        <div className="grid grid-cols-3 md:flex md:flex-row gap-4 h-[100px] md:h-[140px] w-full items-stretch justify-center">
                            {SPORTS.map((sport) => {
                                const isSelected = selectedSport === sport.id;
                                const Icon = sport.icon;

                                return (
                                    <motion.div
                                        key={sport.id}
                                        layout
                                        initial={{ flex: 1 }}
                                        animate={{
                                            flex: isSelected ? 2 : 1,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <motion.button
                                            onClick={() => setSelectedSport(isSelected ? null : sport.id)}
                                            className={`relative rounded-3xl overflow-hidden border transition-colors duration-300 flex flex-col items-center justify-center gap-3 w-full h-full ${
                                                isSelected
                                                    ? "bg-white/20 border-white/60 z-10"
                                                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/15 hover:border-white/40"
                                            }`}
                                        >
                                            <motion.div
                                                layout="position"
                                                animate={{
                                                    scale: isSelected ? 1.2 : 1,
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            >
                                                <Icon className={isSelected ? "w-12 h-12 text-white" : "w-10 h-10 text-white/60"} />
                                            </motion.div>

                                            <motion.span
                                                layout="position"
                                                className={`hidden md:block text-base font-medium tracking-wide ${isSelected ? "text-white" : "text-white/60"}`}
                                            >
                                                {sport.label}
                                            </motion.span>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}