"use client";

import { AlertCircle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import adrLogo from "@/public/ADR.webp";
import { SpinAdranalink } from "@/src/components/ui/SpinAdranalink";
import { useState } from "react";

interface WelcomeSchoolResponseBannerProps {
    status: "success" | "error";
    title: string;
    message: string;
    primaryButtonText: string;
    onPrimaryAction: () => void;
    secondaryButtonText?: string;
    onSecondaryAction?: () => void;
    errorDetails?: string;
}

export function WelcomeSchoolResponseBanner({
    status,
    title,
    message,
    primaryButtonText,
    onPrimaryAction,
    secondaryButtonText,
    onSecondaryAction,
    errorDetails,
}: WelcomeSchoolResponseBannerProps) {
    const isSuccess = status === "success";
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className={`
                    rounded-[2.5rem] border p-8 md:p-16 text-center shadow-2xl
                    ${isSuccess ? "bg-white border-zinc-200" : "bg-card border-warning/30"}
                `}
            >
                <div className="space-y-8 md:space-y-12 flex flex-col items-center">
                    {/* Visuals */}
                    {isSuccess ? (
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Image 
                                    src={adrLogo} 
                                    alt="Adrenalink" 
                                    width={240} 
                                    height={240} 
                                    className="dark:invert drop-shadow-sm" 
                                    priority 
                                />
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-warning/10 text-warning"
                        >
                            <AlertCircle className="w-12 h-12" />
                        </motion.div>
                    )}

                    {/* Content */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
                        <h1 className="text-3xl md:text-6xl font-black text-zinc-900 tracking-tight">{title}</h1>
                        <p className="text-zinc-500 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">{message}</p>

                        {errorDetails && (
                            <div className="mt-6 p-4 bg-muted/50 rounded-xl inline-block text-left max-w-full overflow-hidden text-ellipsis border border-border/50">
                                <p className="text-xs md:text-sm text-muted-foreground/80 font-mono break-all">
                                    Error: {errorDetails}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6 w-full flex flex-col items-center"
                    >
                        {/* Founder Contact (Error only) */}
                        {!isSuccess && (
                            <div className="p-4 bg-muted/30 rounded-xl inline-block">
                                <p className="text-sm font-medium mb-2 text-muted-foreground">Contact me directly:</p>
                                <a
                                    href="https://wa.me/+34686516248"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-secondary hover:text-secondary/80 font-bold transition-colors text-lg"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Victor Rubio - Founder
                                </a>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 justify-center items-center pt-4 w-full">
                            <button
                                onClick={onPrimaryAction}
                                onMouseEnter={() => setIsButtonHovered(true)}
                                onMouseLeave={() => setIsButtonHovered(false)}
                                className={`
                                    px-10 py-4 rounded-full font-bold text-lg md:text-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-3
                                    ${
                                        isSuccess
                                            ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    }
                                `}
                            >
                                {isSuccess && (
                                    <SpinAdranalink isSpinning={isButtonHovered} size={24} className="text-white" duration={0.8} />
                                )}
                                <span>{primaryButtonText}</span>
                            </button>

                            {secondaryButtonText && onSecondaryAction && (
                                <button
                                    onClick={onSecondaryAction}
                                    className="text-muted-foreground hover:text-foreground text-base underline transition-colors px-4 py-2"
                                >
                                    {secondaryButtonText}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
