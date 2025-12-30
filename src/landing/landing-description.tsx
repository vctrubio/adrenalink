"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { SportSelection } from "@/src/components/school/SportSelection";

const USER_ROLES = [
    { id: "admin", label: "Admin", icon: AdminIcon },
    { id: "student", label: "Student", icon: HelmetIcon },
    { id: "teacher", label: "Teacher", icon: HeadsetIcon },
];

export function LandingDescription() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [hoveredRole, setHoveredRole] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (selectedRole && selectedSport) {
            setIsNavigating(true);
            const targetPath = selectedRole === "admin" ? "/pillars" : "/schools";
            const timer = setTimeout(() => {
                router.push(targetPath);
            }, 800); // Wait for animation
            return () => clearTimeout(timer);
        }
    }, [selectedRole, selectedSport, router]);

    return (
        <section className="h-screen snap-start relative overflow-hidden ">
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
                animate={isNavigating ? { opacity: 0, scale: 1.5, filter: "blur(10px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative z-10 h-full flex flex-col items-center justify-center px-4"
            >
                <div className="w-full max-w-5xl space-y-12 text-center">
                    {/* Join Forces Heading */}
                    <div className="space-y-6 flex flex-col items-center">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            <div
                                className="w-[240px] h-[240px] bg-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]"
                                style={{
                                    maskImage: "url(/ADR.webp)",
                                    maskSize: "contain",
                                    maskRepeat: "no-repeat",
                                    maskPosition: "center",
                                    WebkitMaskImage: "url(/ADR.webp)",
                                    WebkitMaskSize: "contain",
                                    WebkitMaskRepeat: "no-repeat",
                                    WebkitMaskPosition: "center",
                                }}
                            />
                        </motion.div>
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] uppercase">Join Forces</h2>
                            <p className="text-base text-white/40 font-light tracking-[0.5em] uppercase">Who are you?</p>
                        </div>
                    </div>

                    {/* User Role Selection */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 md:flex md:flex-row gap-4 h-[100px] md:h-[140px] w-full items-stretch justify-center">
                            {USER_ROLES.map((role) => {
                                const isSelected = selectedRole === role.id;
                                const isHovered = hoveredRole === role.id;
                                const Icon = role.icon;

                                return (
                                    <motion.div
                                        key={role.id}
                                        layout
                                        initial={{ flex: 1 }}
                                        animate={{
                                            flex: isHovered ? 2 : 1,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <motion.button
                                            onClick={() => setSelectedRole(isSelected ? null : role.id)}
                                            onHoverStart={() => setHoveredRole(role.id)}
                                            onHoverEnd={() => setHoveredRole(null)}
                                            className={`relative rounded-[2rem] overflow-hidden border transition-all duration-500 flex flex-col items-center justify-center gap-2 w-full h-full shadow-lg ${
                                                isSelected 
                                                    ? "bg-white/20 border-white/60 text-white z-10" 
                                                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/15 hover:border-white/40"
                                            }`}
                                        >
                                            <motion.div
                                                layout="position"
                                                animate={{
                                                    scale: isHovered ? 1.2 : 1,
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                className="flex items-center justify-center"
                                            >
                                                <Icon size={42} className="transition-all duration-300" />
                                            </motion.div>

                                            <motion.span 
                                                layout="position" 
                                                className={`hidden md:block text-xs font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                                                    isHovered || isSelected ? "text-white" : "text-white/60"
                                                }`}
                                            >
                                                {role.label}
                                            </motion.span>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Sport Selection - Reusable Component */}
                        <SportSelection selectedSport={selectedSport} onSelectSport={setSelectedSport} variant="landing" />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
