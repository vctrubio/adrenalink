"use client";

import { useState, Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useUser, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import type { SchoolPackage } from "@/supabase/db/types";
import { getHMDuration } from "@/getters/duration-getter";
import { createStudentPackageRequest } from "@/supabase/server/student-package";
import { toast } from "react-hot-toast";
import { getTodayDateString } from "@/getters/date-getter";
import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";

interface StudentRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: SchoolPackage | null;
    currencySymbol: string;
}

export function StudentRequestModal({ isOpen, onClose, pkg, currencySymbol }: StudentRequestModalProps) {
    const { user, isLoaded } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Date Range State
    const [startDate, setStartDate] = useState(getTodayDateString());
    const [endDate, setEndDate] = useState(getTodayDateString());

    const maxDate = useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().split("T")[0];
    }, []);

    if (!pkg) return null;

    const durationHours = pkg.duration_minutes / 60;
    const pph = pkg.duration_minutes !== 60 ? Math.round(pkg.price_per_student / durationHours) : null;

    const handleSubmit = async () => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            const result = await createStudentPackageRequest({
                schoolPackageId: pkg.id,
                startDate,
                endDate,
                clerkId: user.id
            });

            if (result.success) {
                setIsSuccess(true);
                toast.success("Request submitted successfully!");
                // Keep modal open for success state, or close after delay
                setTimeout(() => {
                    onClose();
                    // Reset state for next time
                    setTimeout(() => {
                        setIsSuccess(false);
                        setIsSubmitting(false);
                    }, 500);
                }, 2000);
            } else {
                toast.error(result.error || "Failed to submit request");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    const handleSignInClick = () => {
        // Flag that we are starting Clerk sign-in for persistence
        sessionStorage.setItem("clerk_signin_requested", "true");
        sessionStorage.setItem("requested_package_id", pkg.id);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[9999]">
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md" />
                </Transition.Child>

                {/* Modal Positioning */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-xl bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden relative">
                            
                            {/* Header with Identity Badge */}
                            <div className="absolute top-0 right-0 z-20 max-w-full group">
                                <div className="bg-muted/50 backdrop-blur-md border-b border-l border-border/50 pl-6 pr-4 py-3 rounded-bl-[2rem] flex items-center gap-3 shadow-sm min-w-[140px] justify-center relative">
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

                                    {/* Invisible Clerk Button Overlay */}
                                    {user && (
                                        <div className="absolute inset-0 w-full h-full opacity-0 hover:opacity-0 z-10 cursor-pointer overflow-hidden rounded-bl-[2rem]">
                                            <UserButton 
                                                appearance={{
                                                    elements: {
                                                        rootBox: "w-full h-full",
                                                        avatarBox: "w-full h-full",
                                                        userButtonTrigger: "w-full h-full focus:shadow-none"
                                                    }
                                                }}
                                                afterSignOutUrl={typeof window !== 'undefined' ? window.location.href : "/"} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="absolute top-4 left-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 pt-16">
                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <motion.div 
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-12 flex flex-col items-center text-center space-y-6"
                                        >
                                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                                                <CheckCircle2 size={48} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black uppercase tracking-tight">Request Sent!</h3>
                                                <p className="text-muted-foreground">The school will review your application soon.</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="form"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            {/* Package Title & Price */}
                                            <div className="text-center space-y-2">
                                                <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-tight px-4">
                                                    {pkg.description}
                                                </h2>
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-3 text-secondary font-black">
                                                        <span className="text-xs uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                                                            {getHMDuration(pkg.duration_minutes)}
                                                        </span>
                                                        <span className="text-4xl tracking-tighter">
                                                            {currencySymbol}{pkg.price_per_student}
                                                        </span>
                                                    </div>
                                                    {pph && (
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                            {currencySymbol}{pph} per hour
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Body */}
                                            {!user ? (
                                                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 text-center space-y-6 border border-dashed border-border">
                                                    <div className="space-y-2">
                                                        <h4 className="text-xl font-bold">Ready to Register?</h4>
                                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                            Please sign in to request this package. Your progress will be linked to your account.
                                                        </p>
                                                    </div>
                                                    <SignInButton mode="modal">
                                                        <button 
                                                            onClick={handleSignInClick}
                                                            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-secondary/20 flex items-center gap-3 mx-auto"
                                                        >
                                                            <span>Get Started</span>
                                                            <ArrowRight size={20} />
                                                        </button>
                                                    </SignInButton>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Requested Start</label>
                                                            <div className="relative">
                                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <input 
                                                                    type="date" 
                                                                    value={startDate}
                                                                    onChange={(e) => setStartDate(e.target.value)}
                                                                    min={getTodayDateString()}
                                                                    max={maxDate}
                                                                    className="w-full h-12 pl-10 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Requested End</label>
                                                            <div className="relative">
                                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <input 
                                                                    type="date" 
                                                                    value={endDate}
                                                                    onChange={(e) => setEndDate(e.target.value)}
                                                                    min={startDate}
                                                                    max={maxDate}
                                                                    className="w-full h-12 pl-10 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleSubmit}
                                                        disabled={isSubmitting}
                                                        className={`
                                                            w-full py-5 rounded-2xl font-black uppercase tracking-wider text-lg transition-all flex items-center justify-center gap-3
                                                            ${isSubmitting 
                                                                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                                                                : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl active:scale-[0.98]"}
                                                        `}
                                                    >
                                                        {isSubmitting ? "Submitting..." : "Send Request"}
                                                        {!isSubmitting && <ArrowRight size={20} />}
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer info */}
                            <div className="px-8 py-4 bg-muted/20 border-t border-border/50 text-center">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
                                    Adrenalink Reservation System
                                </p>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}