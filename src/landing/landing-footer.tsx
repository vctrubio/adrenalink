"use client";

import { useState } from "react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function DevAboutMeFooter() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="h-screen snap-start relative overflow-hidden">
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
                        className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md transition-all duration-300 cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {/* Main Content */}
                        <div className="px-16 py-12 text-center">
                            <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-white">
                                Discover More
                            </h2>
                            <p className="text-3xl md:text-5xl font-bold tracking-tight text-white/60 mt-4">
                                And Connect
                            </p>
                        </div>

                        {/* Footer with Toggle Icon */}
                        <div className="bg-zinc-900">
                            <div className="px-6 py-4 flex items-center justify-between min-h-[72px]">
                                <div className="text-white">
                                    <p className="font-bold text-lg">Adrenalink</p>
                                    <p className="text-sm text-white/60">Connecting Students</p>
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
                                            <div className="group cursor-pointer">
                                                <p className="font-bold text-base group-hover:text-white/60 transition-colors duration-500">Lesson Management</p>
                                                <p className="text-sm text-white/60 group-hover:text-white mt-1 transition-colors duration-500">3 way communication</p>
                                            </div>

                                            <div className="group cursor-pointer">
                                                <p className="font-bold text-base group-hover:text-white/60 transition-colors duration-500">Payment Tracking</p>
                                                <p className="text-sm text-white/60 group-hover:text-white mt-1 transition-colors duration-500">To the minute.</p>
                                            </div>

                                            <div className="group cursor-pointer">
                                                <p className="font-bold text-base group-hover:text-white/60 transition-colors duration-500">Equipment Handling</p>
                                                <p className="text-sm text-white/60 group-hover:text-white mt-1 transition-colors duration-500">Know when it's time to say goodbye</p>
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
