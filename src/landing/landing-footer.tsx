"use client";

import { BackgroundImage } from "@/src/components/BackgroundImage";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";

export function DevAboutMeFooter() {
    const router = useRouter();

    return (
        <section className="h-screen snap-start snap-always relative overflow-hidden">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/wave.jpg"
                position="absolute"
                overlay="linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.8) 100%)"
                transform="rotate(180deg)"
            />

            <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6">
                <div className="max-w-4xl w-full">
                    <motion.div
                        layout
                        className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md transition-all duration-300"
                    >
                        {/* Main Content */}
                        <div className="px-6 sm:px-12 md:px-16 py-8 sm:py-10 md:py-12 text-center group cursor-pointer" onClick={() => router.push("/welcome")}>
                            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-white/20">
                                Discover More
                            </h2>
                            <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight text-white/60 mt-3 sm:mt-4 block transition-all duration-300 group-hover:text-white group-hover:scale-105">
                                Register Form
                            </p>
                        </div>

                        <div className="bg-zinc-900 flex divide-y divide-white">

                            <div className="overflow-hidden">
                                <div className="border-t border-white/10" />
                                <div className="px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-white">
                                    <div className="group cursor-pointer flex items-start gap-2 sm:gap-3">
                                        <FlagIcon
                                            size={40}
                                            className="sm:w-12 sm:h-12 text-white/60 group-hover:text-white transition-colors duration-500 flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base group-hover:text-white/60 transition-colors duration-500">
                                                Lesson Management
                                            </h3>
                                            <p className="text-xs sm:text-sm text-white/60 group-hover:text-white transition-colors duration-500">
                                                3 way communication
                                            </p>
                                        </div>
                                    </div>

                                    <div className="group cursor-pointer flex items-start gap-2 sm:gap-3">
                                        <CreditIcon
                                            size={40}
                                            className="sm:w-12 sm:h-12 text-white/60 group-hover:text-white transition-colors duration-500 flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base group-hover:text-white/60 transition-colors duration-500">
                                                Payment Tracking
                                            </h3>
                                            <p className="text-xs sm:text-sm text-white/60 group-hover:text-white transition-colors duration-500">
                                                To the minute.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="group cursor-pointer flex items-start gap-2 sm:gap-3">
                                        <EquipmentIcon
                                            size={40}
                                            className="sm:w-12 sm:h-12 text-white/60 group-hover:text-white transition-colors duration-500 flex-shrink-0"
                                        />
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base group-hover:text-white/60 transition-colors duration-500">
                                                Equipment Handling
                                            </h3>
                                            <p className="text-xs sm:text-sm text-white/60 group-hover:text-white transition-colors duration-500">
                                                Know when it's time to say goodbye
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
