"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormInput } from "@/src/components/ui/form";
import type { SchoolFormData } from "./WelcomeSchoolSteps";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedCanvas } from "@/src/landing/animated-canvas";

interface WelcomeSchoolNameRegistrationProps {
    formMethods: UseFormReturn<SchoolFormData>;
    isGeneratingUsername: boolean;
    usernameStatus: "available" | "unavailable" | "checking" | null;
    onNameBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
}

export function WelcomeSchoolNameRegistration({
    formMethods,
    isGeneratingUsername,
    usernameStatus,
    onNameBlur,
    onUsernameChange,
    onNext,
}: WelcomeSchoolNameRegistrationProps) {
    const {
        register,
        formState: { errors, isValid },
        watch,
        trigger,
        setValue,
    } = formMethods;
    const values = watch();

    const handleNext = async () => {
        const isValidStep = await trigger(["name", "username"]);
        if (isValidStep && usernameStatus === "available") {
            onNext();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl mx-auto bg-card rounded-xl border border-border/50 shadow-lg relative overflow-hidden"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <AnimatedCanvas className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 space-y-8">
                <div className="space-y-6">
                    <FormField label="School Name" required error={errors.name?.message} isValid={!errors.name && !!values.name && values.name.length > 0}>
                        <FormInput 
                            {...register("name")} 
                            placeholder="Enter school name" 
                            autoFocus 
                            onBlur={onNameBlur} 
                            className="text-lg py-6 bg-background/80 backdrop-blur-sm" 
                        />
                    </FormField>

                    <FormField
                        label="Username"
                        required
                        error={errors.username?.message}
                        isValid={!errors.username && !!values.username && values.username.length > 0 && usernameStatus === "available"}
                    >
                        <div className="relative">
                            <FormInput
                                {...register("username", { 
                                    onChange: (e) => {
                                        // Enforce lowercase and allowed characters
                                        const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                                        
                                        // Only update if changed to avoid cursor jumping if possible (though straightforward replacement usually jumps at end)
                                        if (sanitized !== e.target.value) {
                                            setValue("username", sanitized);
                                            e.target.value = sanitized;
                                        }
                                        
                                        onUsernameChange(e);
                                    }
                                })}
                                placeholder={isGeneratingUsername ? "Checking Availability..." : "school.adrenaline.com"}
                                disabled={isGeneratingUsername}
                                className={`
                                    text-lg py-6 bg-background/80 backdrop-blur-sm
                                    ${isGeneratingUsername ? "animate-pulse" : ""}
                                    ${usernameStatus === "available" ? "border-secondary focus:ring-secondary" : ""}
                                    ${usernameStatus === "unavailable" ? "border-warning focus:ring-warning" : ""}
                                `}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                {isGeneratingUsername && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                                {usernameStatus === "checking" && !isGeneratingUsername && (
                                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {usernameStatus === "available" && (
                                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                {usernameStatus === "unavailable" && (
                                    <div className="w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                            <path d="M6 2L2 6M2 2L6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FormField>
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!values.name || !values.username || usernameStatus !== "available"}
                    className={`
                        w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
                        ${
                            !values.name || !values.username || usernameStatus !== "available"
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        }
                    `}
                >
                    Register School <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
