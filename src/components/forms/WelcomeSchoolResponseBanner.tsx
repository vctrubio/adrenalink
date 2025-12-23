"use client";

import { AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

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

    return (
        <div className="w-full">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className={`
                    rounded-xl border p-6 md:p-10 text-center shadow-lg
                    ${isSuccess ? "bg-card border-border" : "bg-card border-warning/30"}
                `}
            >
                <div className="space-y-6 md:space-y-8">
                    {/* Icon */}
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`
                            w-20 h-20 rounded-full flex items-center justify-center mx-auto
                            ${isSuccess ? "bg-secondary/10 text-secondary" : "bg-warning/10 text-warning"}
                        `}
                    >
                        {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                    </motion.div>

                    {/* Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{message}</p>
                        
                        {errorDetails && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg inline-block text-left max-w-full overflow-hidden text-ellipsis">
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
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        {/* Founder Contact (Error only) */}
                        {!isSuccess && (
                            <div className="p-4 bg-muted/30 rounded-lg inline-block">
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

                        <div className="flex flex-col gap-3 justify-center items-center pt-2">
                            <button 
                                onClick={onPrimaryAction} 
                                className={`
                                    px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5
                                    ${isSuccess 
                                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    }
                                `}
                            >
                                {primaryButtonText}
                            </button>

                            {secondaryButtonText && onSecondaryAction && (
                                <button 
                                    onClick={onSecondaryAction} 
                                    className="text-muted-foreground hover:text-foreground text-sm underline transition-colors px-4 py-2"
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
