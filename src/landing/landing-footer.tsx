"use client";

import { useState } from "react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";

export function DevAboutMeFooter() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    return (
        <section className="h-screen snap-start snap-always relative overflow-hidden">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/wave.jpg"
                position="absolute"
                overlay="linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.8) 100%)"
                transform="rotate(180deg)"
            />

            <div className="relative z-10 h-full flex items-center justify-center px-4">
                <div className="max-w-4xl w-full">
                    <motion.div
                        layout
                        className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md transition-all duration-300"
                    >
                        {/* Main Content */}
                        <div className="px-16 py-12 text-center group cursor-pointer" onClick={() => router.push("/welcome")}>
                            <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-white/20">
                                Discover More
                            </h2>
                            <p className="text-3xl md:text-5xl font-bold tracking-tight text-white/60 mt-4 block transition-all duration-300 group-hover:text-white group-hover:scale-105">
                                Register a school
                            </p>
                        </div>

                        <div className="bg-zinc-900">
                            <div className="px-6 py-4 flex items-center justify-between min-h-[84px]">
                                <div className="text-white flex items-center gap-1">
                                    <Image
                                        src="/ADR.webp"
                                        alt="Adrenalink Logo"
                                        width={48}
                                        height={48}
                                        className="brightness-0 invert"
                                    />
                                    <div>
                                        <p className="text-3xl leading-none font-black tracking-tighter pt-4">Adrenalink</p>
                                        <p className="text-sm text-white/60 font-normal">Connecting Students</p>
                                    </div>
                                </div>

                                <ToggleAdranalinkIcon
                                    isOpen={isOpen}
                                    onClick={(e) => {
                                        e?.stopPropagation();
                                        setIsOpen(!isOpen);
                                    }}
                                    color="white"
                                    variant="lg"
                                />
                            </div>

                            {/* Dropdown Content */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-white/10" />
                                        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                                            <div className="group cursor-pointer flex items-start gap-3">
                                                <FlagIcon
                                                    size={48}
                                                    className="text-white/60 group-hover:text-white transition-colors duration-500 flex-shrink-0"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-base group-hover:text-white/60 transition-colors duration-500">
                                                        Lesson Management
                                                    </h3>
                                                    <p className="text-sm text-white/60 group-hover:text-white transition-colors duration-500">
                                                        3 way communication
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="group cursor-pointer flex items-start gap-3">
                                                <CreditIcon
                                                    size={48}
                                                    className="text-white/60 group-hover:text-white transition-colors duration-500 flex-shrink-0"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-base group-hover:text-white/60 transition-colors duration-500">
                                                        Payment Tracking
                                                    </h3>
                                                    <p className="text-sm text-white/60 group-hover:text-white transition-colors duration-500">
                                                        To the minute.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="group cursor-pointer flex items-start gap-3">
                                                <EquipmentIcon
                                                    size={48}
                                                    className="text-white/60 group-hover:text-white transition-colors duration-500 flex-shrink-0"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-base group-hover:text-white/60 transition-colors duration-500">
                                                        Equipment Handling
                                                    </h3>
                                                    <p className="text-sm text-white/60 group-hover:text-white transition-colors duration-500">
                                                        Know when it's time to say goodbye
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
