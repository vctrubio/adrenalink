"use client";

import { useState } from "react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LandingHeroDescription } from "./landing-hero";

export function DevAboutMeFooter() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

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
                    <motion.div layout className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md transition-all duration-300">
                        {/* Main Content */}
                        <div className="px-16 py-12 text-center group cursor-pointer" onClick={() => router.push("/schools")}>
                            <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-white/20">Discover More</h2>
                            <p className="text-3xl md:text-5xl font-bold tracking-tight text-white/60 mt-4 block transition-all duration-300 group-hover:text-white group-hover:scale-105">Find a School</p>
                        </div>

                        <div className="bg-zinc-900">
                            <div className="px-6 py-4 flex items-center justify-between min-h-[84px]">
                                <div className="text-white flex items-end gap-3">
                                    <Image src="/ADR.webp" alt="Adrenalink Logo" width={42} height={42} className="brightness-0 invert mb-1" />
                                    <div className="relative mb-1">
                                        <p className="text-3xl leading-none font-black tracking-tighter ">Adrenalink</p>
                                        <p className="absolute top-[24px] text-sm text-white/60 whitespace-nowrap font-normal tracking-normal">Connecting Students</p>
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
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="overflow-hidden">
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
