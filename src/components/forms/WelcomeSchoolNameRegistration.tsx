"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormInput } from "@/src/components/ui/form";
import type { SchoolFormData } from "./WelcomeSchoolSteps";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedCanvas } from "@/src/landing/animated-canvas";
import { SignInButton } from "@clerk/nextjs";
import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";
import { ClerkData } from "@/types/user";

interface WelcomeSchoolNameRegistrationProps {
    formMethods: UseFormReturn<SchoolFormData>;
    isGeneratingUsername: boolean;
    usernameStatus: "available" | "unavailable" | "checking" | null;
    onNameBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUsernameBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onNext: () => void;
    user: ClerkData | null;
}

export function WelcomeSchoolNameRegistration({
    formMethods,
    isGeneratingUsername,
    usernameStatus,
    onNameBlur,
    onUsernameChange,
    onUsernameBlur,
    onNext,
    user,
}: WelcomeSchoolNameRegistrationProps) {
    const {
        register,
        formState: { errors },
        watch,
        trigger,
        setValue,
        getValues,
    } = formMethods;
    const values = watch();

    const handleNext = async () => {
        const isValidStep = await trigger(["name", "username"]);
        if (isValidStep && usernameStatus === "available") {
            onNext();
        }
    };

    const handleSignInClick = () => {
        // Flag that we are starting Clerk sign-in for persistence
        sessionStorage.setItem("clerk_signin_started", "true");
        // Save current UI state
        sessionStorage.setItem(
            "welcome_form_ui_state",
            JSON.stringify({
                isNameRegistered: false,
                currentStep: 0,
            }),
        );
        // Save current form data
        const draft = {
            ...getValues(),
            iconFile: undefined,
            bannerFile: undefined,
        };
        sessionStorage.setItem("welcome_form_draft", JSON.stringify(draft));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl mx-auto bg-card rounded-xl border border-border/50 shadow-lg relative overflow-hidden"
        >
            {/* Identity Badge - Top Right */}
            <div className="absolute top-0 right-0 z-20 max-w-full">
                <div className="bg-background/80 backdrop-blur-md border-b border-l border-border/50 px-6 py-3 rounded-bl-[2rem] flex items-center gap-3 shadow-sm min-w-[140px] justify-center overflow-x-auto no-scrollbar">
                    <SchoolIcon className="text-secondary shrink-0" size={18} />

                    {!user ? (
                        <SignInButton mode="modal">
                            <button
                                onClick={handleSignInClick}
                                className="text-xs font-black tracking-widest uppercase hover:text-secondary transition-colors text-foreground/70 whitespace-nowrap"
                            >
                                Sign In
                            </button>
                        </SignInButton>
                    ) : (
                        <span className="text-xs font-black tracking-widest uppercase text-secondary whitespace-nowrap">
                            {user?.firstName} {user?.lastName}
                        </span>
                    )}
                </div>
            </div>

            {/* Animated Background */}
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <AnimatedCanvas className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 pt-16 space-y-8 min-h-[400px] flex flex-col">
                {!user ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-3">
                            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                                To begin registering your school, we first need to verify your identity.
                            </p>
                        </div>

                        <SignInButton mode="modal">
                            <button
                                onClick={handleSignInClick}
                                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-all active:scale-95 shadow-xl shadow-secondary/20 flex items-center gap-3"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </SignInButton>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <FormField
                            label="School Name"
                            required
                            error={errors.name?.message}
                            isValid={!errors.name && !!values.name && values.name.length > 0}
                        >
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
                            isValid={
                                !errors.username && !!values.username && values.username.length > 0 && usernameStatus === "available"
                            }
                        >
                            <div className="relative">
                                <FormInput
                                    {...register("username", {
                                        onChange: (e) => {
                                            // Enforce lowercase and allowed characters
                                            const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");

                                            // Only update if changed to avoid cursor jumping if possible
                                            if (sanitized !== e.target.value) {
                                                setValue("username", sanitized);
                                                e.target.value = sanitized;
                                            }

                                            onUsernameChange(e);
                                        },
                                    })}
                                    onBlur={onUsernameBlur}
                                    placeholder={isGeneratingUsername ? "Checking Availability..." : "school.adrenalink.com"}
                                    disabled={isGeneratingUsername}
                                    className={`
                                        text-lg py-6 bg-background/80 backdrop-blur-sm
                                        ${isGeneratingUsername ? "animate-pulse" : ""}
                                        ${usernameStatus === "available" ? "border-secondary focus:ring-secondary" : ""}
                                        ${usernameStatus === "unavailable" ? "border-warning focus:ring-warning" : ""}
                                    `}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                    {isGeneratingUsername && (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {usernameStatus === "checking" && !isGeneratingUsername && (
                                        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {usernameStatus === "available" && (
                                        <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path
                                                    d="M9 1L3.5 6.5L1 4"
                                                    stroke="white"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    {usernameStatus === "unavailable" && (
                                        <div className="w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path
                                                    d="M6 2L2 6M2 2L6 6"
                                                    stroke="white"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormField>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!values.name || !values.username || usernameStatus !== "available"}
                            className={`
                                w-full py-4 mt-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
                                ${
                                    !values.name || !values.username || usernameStatus !== "available"
                                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                }
                            `}
                        >
                            Start Your Adventure
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}