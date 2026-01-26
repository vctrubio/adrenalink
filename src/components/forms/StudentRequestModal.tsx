"use client";

import { useState, Fragment, useMemo, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useUser, SignInButton, SignedIn, UserButton, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ArrowRight, CheckCircle2, User as UserIcon, Mail, Globe, Languages, CreditCard, Phone } from "lucide-react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { SchoolPackage } from "@/supabase/db/types";
import { getHMDuration } from "@/getters/duration-getter";
import { createStudentPackageRequest } from "@/supabase/server/student-package";
import { checkStudentSchoolRelation, registerStudentForSchool } from "@/supabase/server/student-registration";
import { toast } from "react-hot-toast";
import { getTodayDateString } from "@/getters/date-getter";
import { FormField, FormInput } from "@/src/components/ui/form";
import { COUNTRIES } from "@/config/countries";
import { useRouter } from "next/navigation";
import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import { ClerkUserDropdown } from "@/src/components/auth/ClerkUserDropdown";
import { DoubleDatePicker, DateRange } from "@/src/components/pickers/DoubleDatePicker";
import { LANGUAGES } from "@/supabase/db/enums";

const LANGUAGE_OPTIONS = Object.values(LANGUAGES);

// Schema for registration step
const registrationSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(1, "Phone number is required"),
    passport: z.string().min(1, "Passport/ID is required"),
    country: z.string().min(1, "Country is required"),
    languages: z.array(z.string()).min(1, "At least one language is required"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface StudentRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: SchoolPackage | null;
    currencySymbol: string;
}

export function StudentRequestModal({ isOpen, onClose, pkg, currencySymbol }: StudentRequestModalProps) {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [step, setStep] = useState<"identity" | "dates">("identity");
    const [isCheckingRelation, setIsCheckingRelation] = useState(false);
    const [relationData, setRelationData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Date Range State
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: getTodayDateString(),
        endDate: getTodayDateString(),
    });

    const methods = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            phone: "",
            passport: "",
            country: "",
            languages: ["English"],
        },
    });

    // Reset internal state when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsSuccess(false);
                setIsSubmitting(false);
                setStep("identity");
            }, 500); // Wait for transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Check relationship when user signs in or modal opens
    useEffect(() => {
        if (isOpen && user && isLoaded) {
            const verifyRelation = async () => {
                setIsCheckingRelation(true);
                const result = await checkStudentSchoolRelation(user.id);
                if (result.success && result.data) {
                    setRelationData(result.data);
                } else {
                    setRelationData(null);
                }
                setIsCheckingRelation(false);
            };
            verifyRelation();
        }
    }, [isOpen, user, isLoaded]);

    // Update form when Clerk user loads
    useEffect(() => {
        if (user) {
            methods.setValue("firstName", user.firstName || "");
            methods.setValue("lastName", user.lastName || "");
        }
    }, [user, methods]);

    if (!pkg) return null;

    const durationHours = pkg.duration_minutes / 60;
    const pph = pkg.duration_minutes !== 60 ? Math.round(pkg.price_per_student / durationHours) : null;

    const handleRegistrationSubmit = async (data: RegistrationFormData) => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            const result = await registerStudentForSchool({
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                ...data
            });

            if (result.success) {
                const relationResult = await checkStudentSchoolRelation(user.id);
                if (relationResult.success && relationResult.data) {
                    setRelationData(relationResult.data);
                }
                setStep("dates");
            } else {
                toast.error(result.error || "Failed to register student");
            }
        } catch (error) {
            toast.error("An unexpected error occurred during registration");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            const result = await createStudentPackageRequest({
                schoolPackageId: pkg.id,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                clerkId: user.id
            });

            if (result.success) {
                setIsSuccess(true);
                toast.success("Request submitted successfully!");
                
                setTimeout(() => {
                    const studentId = relationData?.student?.id;
                    onClose();
                    if (studentId) {
                        router.push(`/student/${studentId}/requests`);
                    }
                }, 2000);
            } else {
                toast.error(result.error || "Failed to submit request");
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        await signOut({ redirectUrl: window.location.href });
    };

    const handleSignInClick = () => {
        sessionStorage.setItem("clerk_signin_requested", "true");
        sessionStorage.setItem("requested_package_id", pkg.id);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[9999]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-xl bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden relative">
                            
                            <div className="absolute top-0 right-0 z-20 max-w-full group">
                                <div className="bg-muted/50 backdrop-blur-md border-b border-l border-border/50 pl-6 pr-4 py-3 rounded-bl-[2rem] flex items-center gap-3 shadow-sm min-w-[140px] justify-center relative">
                                    <SchoolIcon className="text-secondary shrink-0" size={18} />
                                    
                                    {!user ? (
                                        <SignInButton mode="modal">
                                            <button onClick={handleSignInClick} className="text-xs font-black tracking-widest uppercase hover:text-secondary transition-colors text-foreground/70 whitespace-nowrap">
                                                Sign In
                                            </button>
                                        </SignInButton>
                                    ) : (
                                        <span className="text-xs font-black tracking-widest uppercase text-secondary whitespace-nowrap">
                                            {user?.fullName}
                                        </span>
                                    )}

                                    {user && (
                                        <div className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer overflow-hidden rounded-bl-[2rem]">
                                            <UserButton afterSignOutUrl={typeof window !== "undefined" ? window.location.href : "/"} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={onClose} className="absolute top-4 left-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground z-20">
                                <X size={20} />
                            </button>

                            <div className="flex flex-col min-h-[500px]">
                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <div className="p-8 pt-16 flex flex-col items-center justify-center flex-1">
                                            <SuccessView />
                                        </div>
                                    ) : !user ? (
                                        <div className="p-8 pt-16 flex flex-col flex-1">
                                            <SignInPrompt onSignInClick={handleSignInClick} />
                                        </div>
                                    ) : isCheckingRelation ? (
                                        <div className="p-8 pt-16 flex flex-col flex-1">
                                            <LoadingState />
                                        </div>
                                    ) : step === "identity" ? (
                                        <div className="p-8 pt-16 flex flex-col flex-1">
                                            <IdentityStep 
                                                relationData={relationData}
                                                pkg={pkg}
                                                currencySymbol={currencySymbol}
                                                pph={pph}
                                                formMethods={methods}
                                                onSubmit={handleRegistrationSubmit}
                                                onNext={() => setStep("dates")}
                                                isSubmitting={isSubmitting}
                                                onSignOut={handleSignOut}
                                                user={user}
                                                setStep={setStep}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col flex-1">
                                            <DatesStep 
                                                pkg={pkg}
                                                currencySymbol={currencySymbol}
                                                pph={pph}
                                                dateRange={dateRange}
                                                setDateRange={setDateRange}
                                                onSubmit={handleFinalSubmit}
                                                isSubmitting={isSubmitting}
                                                step={step}
                                                setStep={setStep}
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}

function ModalStepper({ step, setStep }: { step: "identity" | "dates", setStep: (s: "identity" | "dates") => void }) {
    return (
        <div className="flex items-center justify-center gap-3 py-6">
            <button 
                onClick={() => step === "dates" && setStep("identity")}
                className={`flex items-center gap-2 transition-all ${step === "identity" ? "cursor-default" : "hover:opacity-70"}`}
            >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step === "identity" ? "bg-secondary text-secondary-foreground scale-110 shadow-lg shadow-secondary/20" : "bg-muted text-muted-foreground"}`}>
                    1
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === "identity" ? "text-foreground" : "text-muted-foreground"}`}>Profile</span>
            </button>
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2 transition-all">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step === "dates" ? "bg-secondary text-secondary-foreground scale-110 shadow-lg shadow-secondary/20" : "bg-muted text-muted-foreground"}`}>
                    2
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === "dates" ? "text-foreground" : "text-muted-foreground"}`}>Dates</span>
            </div>
        </div>
    );
}

function PackageHeader({ pkg, currencySymbol, pph }: { pkg: SchoolPackage; currencySymbol: string; pph: number | null }) {
    return (
        <div className="text-center space-y-2 mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
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
    );
}

function SignInPrompt({ onSignInClick }: { onSignInClick: () => void }) {
    return (
        <motion.div key="signin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="py-8 space-y-8">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 text-center space-y-6 border border-dashed border-border">
                <div className="space-y-2">
                    <h4 className="text-xl font-bold uppercase tracking-tight">Identify Your Adventure</h4>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Please sign in to request this package. We will link your request to your student profile.
                    </p>
                </div>
                <SignInButton mode="modal">
                    <button onClick={onSignInClick} className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-secondary/20 flex items-center gap-3 mx-auto uppercase">
                        <span>Get Started</span>
                        <ArrowRight size={20} />
                    </button>
                </SignInButton>
            </div>
        </motion.div>
    );
}

interface IdentityStepProps {
    relationData: any;
    pkg: SchoolPackage;
    currencySymbol: string;
    pph: number | null;
    formMethods: UseFormReturn<RegistrationFormData>;
    onSubmit: (data: RegistrationFormData) => void;
    onNext: () => void;
    isSubmitting: boolean;
    onSignOut: () => void;
    user: any;
    setStep: (s: "identity" | "dates") => void;
}

function IdentityStep({ relationData, pkg, currencySymbol, pph, formMethods, onSubmit, onNext, isSubmitting, onSignOut, user, setStep }: IdentityStepProps) {
    if (relationData) {
        const { student, schoolStudent } = relationData;
        const isRental = schoolStudent?.rental === true;

        return (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 flex flex-col h-full">
                <div className="flex-1 space-y-8">
                    <PackageHeader pkg={pkg} currencySymbol={currencySymbol} pph={pph} />
                    
                    <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4 relative overflow-hidden">
                        <div className="flex items-center gap-4 border-b border-border/50 pb-4 justify-between">
                            <div className="flex items-center gap-4">
                                <div className={"w-14 h-14 rounded-full flex items-center justify-center border border-border shadow-inner bg-card"}>
                                    <HelmetIcon 
                                        className={isRental ? "text-destructive" : "text-yellow-500"} 
                                        size={28} 
                                        rental={isRental} 
                                    />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-tight text-lg">{student.first_name} {student.last_name}</h4>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Verified Student Account</p>
                                </div>
                            </div>

                            <button 
                                onClick={onSignOut}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors border border-border/50 px-3 py-1.5 rounded-lg bg-card/50"
                            >
                                NOT YOU, <span className="text-destructive">SIGN OUT</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Passport/ID</span>
                                <p className="font-bold">{student.passport}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Phone</span>
                                <p className="font-bold">{student.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <ModalStepper step="identity" setStep={setStep} />
                    <button onClick={onNext} className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-wider text-lg hover:bg-zinc-800 shadow-xl transition-all flex items-center justify-center gap-3">
                        <span>Continue to Dates</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div key="registration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex flex-col h-full">
            <div className="flex-1 space-y-6">
                <div className="text-center space-y-1 mb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Create Student Profile</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Complete your registration for this school</p>
                </div>

                <form id="registration-form" onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField label="Email Address" isValid={true}>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormInput value={user?.emailAddresses[0].emailAddress} readOnly className="h-12 pl-10 bg-muted/40 cursor-not-allowed text-muted-foreground font-mono text-xs" />
                        </div>
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="First Name" error={formMethods.formState.errors.firstName?.message}>
                            <FormInput {...formMethods.register("firstName")} placeholder="John" className="h-12 bg-muted/20" />
                        </FormField>
                        <FormField label="Last Name" error={formMethods.formState.errors.lastName?.message}>
                            <FormInput {...formMethods.register("lastName")} placeholder="Doe" className="h-12 bg-muted/20" />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Passport / ID" error={formMethods.formState.errors.passport?.message}>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <FormInput {...formMethods.register("passport")} placeholder="ID Number" className="h-12 pl-10 bg-muted/20" />
                            </div>
                        </FormField>
                        <FormField label="Phone" error={formMethods.formState.errors.phone?.message}>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <FormInput {...formMethods.register("phone")} placeholder="+1 234..." className="h-12 pl-10 bg-muted/20" />
                            </div>
                        </FormField>
                    </div>

                    <FormField label="Country" error={formMethods.formState.errors.country?.message}>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select {...formMethods.register("country")} className="w-full h-12 pl-10 bg-muted/20 border border-border rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-secondary/20">
                                <option value="">Select Country</option>
                                {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </FormField>

                    <FormField label="Languages" error={formMethods.formState.errors.languages?.message}>
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => {
                                const isSelected = formMethods.watch("languages").includes(lang);
                                return (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => {
                                            const current = formMethods.getValues("languages");
                                            const next = isSelected 
                                                ? current.filter(l => l !== lang)
                                                : [...current, lang];
                                            formMethods.setValue("languages", next, { shouldValidate: true });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            isSelected 
                                                ? "bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/20" 
                                                : "bg-muted/20 text-muted-foreground border-border hover:border-muted-foreground/30"
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                );
                            })}
                        </div>
                    </FormField>
                </form>
            </div>

            <div className="mt-auto">
                <ModalStepper step="identity" setStep={setStep} />
                <button type="submit" form="registration-form" disabled={isSubmitting} className="w-full py-5 bg-secondary text-secondary-foreground rounded-2xl font-black uppercase tracking-wider text-lg hover:scale-[1.02] shadow-xl shadow-secondary/20 transition-all flex items-center justify-center gap-3">
                    {isSubmitting ? "Registering..." : "Register & Continue"}
                    <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
}

interface DatesStepProps {
    pkg: SchoolPackage;
    currencySymbol: string;
    pph: number | null;
    dateRange: DateRange;
    setDateRange: (dr: DateRange) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    step: "identity" | "dates";
    setStep: (s: "identity" | "dates") => void;
}

function DatesStep({ pkg, currencySymbol, pph, dateRange, setDateRange, onSubmit, isSubmitting, step, setStep }: DatesStepProps) {
    return (
        <motion.div key="dates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="px-8 pt-12 pb-6">
                <PackageHeader pkg={pkg} currencySymbol={currencySymbol} pph={pph} />
            </div>
            
            <div className="bg-muted/30 border-y border-border/50 py-8 px-10 flex-1">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="text-left">
                        <h3 className="text-lg font-medium text-muted-foreground underline underline-offset-8 decoration-muted-foreground/20">Select Your Dates</h3>
                    </div>

                    <DoubleDatePicker 
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        showNavigationButtons={true}
                        showDayCounter={true}
                    />
                </div>
            </div>

            <div className="p-8 pt-4 bg-card">
                <ModalStepper step="dates" setStep={setStep} />
                <button onClick={onSubmit} disabled={isSubmitting} className={`w-full py-5 rounded-2xl font-black uppercase tracking-wider text-lg transition-all flex items-center justify-center gap-3 ${isSubmitting ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl active:scale-[0.98]"}`}>
                    {isSubmitting ? "Submitting..." : "Send Request"}
                    {!isSubmitting && <ArrowRight size={20} />}
                </button>
            </div>
        </motion.div>
    );
}

function SuccessView() {
    return (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Request Sent!</h3>
                <p className="text-muted-foreground">The school will review your application soon.</p>
            </div>
        </motion.div>
    );
}

function LoadingState() {
    return (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verifying Student Status...</p>
        </div>
    );
}