"use client";

import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSchool, checkUsernameAvailability } from "@/supabase/server/welcome";
import { usePhoneClear } from "@/src/hooks/usePhoneClear";
import { isUsernameReserved } from "@/config/predefinedNames";
import { logger } from "@/backend/logger";
import { SignInButton } from "@clerk/nextjs";
import { UserAuth } from "@/types/user";
// Removed R2 upload utility - now using API route
import { MultiFormContainer } from "./multi";
import {
    AssetsStep,
    SocialStep,
    IdentificationStep,
    CategoriesStep,
    SummaryStep,
    WELCOME_SCHOOL_STEPS,
    type SchoolFormData,
} from "./WelcomeSchoolSteps";
import { WelcomeHeader } from "./WelcomeHeader";
import { WelcomeSchoolNameRegistration } from "./WelcomeSchoolNameRegistration";
import type { BucketMetadata } from "@/types/cloudflare-form-metadata";
import { HandleFormTimeOut } from "./HandleFormTimeOut";
import { motion } from "framer-motion";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { generateUsername, generateUsernameVariants } from "@/src/utils/username-generator";

// Main school schema with validation
const schoolSchema = z.object({
    name: z.string().min(1, "School name is required"),
    username: z
        .string()
        .min(1, "Username is required")
        .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
        .refine((username) => !isUsernameReserved(username), { message: "This username is reserved and cannot be used" }),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().min(1, "Timezone is required"),
    googlePlaceId: z.string().optional(),
    equipmentCategories: z.array(z.enum(["kite", "wing", "windsurf"])).min(1, "Select at least one equipment category"),
    iconFile: z
        .instanceof(File, { message: "Icon file is required" })
        .refine((file) => file && file.type.startsWith("image/"), "Icon must be an image file"),
    bannerFile: z
        .instanceof(File, { message: "Banner file is required" })
        .refine((file) => file && file.type.startsWith("image/"), "Banner must be an image file"),
    ownerEmail: z.string().email("Valid email is required"),
    referenceNote: z.string().optional(),
    websiteUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    currency: z.enum(["USD", "EUR", "CHF"]).default("EUR"),
});

interface WelcomeSchoolFormProps {
    existingUsernames: string[];
    user: UserAuth | null;
}

export function WelcomeSchoolForm({ existingUsernames, user }: WelcomeSchoolFormProps) {
    const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<"available" | "unavailable" | "checking" | null>(null);
    const [pendingToBucket, setPendingToBucket] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [showTimeoutHandler, setShowTimeoutHandler] = useState(false);
    const [timeoutFormData, setTimeoutFormData] = useState<SchoolFormData | null>(null);
    const [uploadStarted, setUploadStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isNameRegistered, setIsNameRegistered] = useState(false);
    const [isResultView, setIsResultView] = useState(false);
    const [createdSchoolUsername, setCreatedSchoolUsername] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<SchoolFormData>({
        resolver: zodResolver(schoolSchema) as any,
        defaultValues: {
            name: "",
            username: "",
            country: "",
            phone: "",
            latitude: undefined,
            longitude: undefined,
            timezone: "",
            googlePlaceId: "",
            equipmentCategories: [],
            iconFile: undefined,
            bannerFile: undefined,
            ownerEmail: user?.email || "",
            referenceNote: "",
            websiteUrl: "",
            instagramUrl: "",
            currency: "EUR",
        },
        mode: "onTouched",
    });

    const { setValue, setFocus, watch, reset } = methods;

    // --- RECOVERY LOGIC (Only for Clerk Flow) ---
    useEffect(() => {
        if (typeof window === "undefined") return;

        const signinStarted = sessionStorage.getItem("clerk_signin_started");
        if (signinStarted === "true" && user) {
            const savedData = sessionStorage.getItem("welcome_form_draft");
            const savedUiState = sessionStorage.getItem("welcome_form_ui_state");

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    reset(parsed);
                    setValue("ownerEmail", user.email);

                    if (savedUiState) {
                        const ui = JSON.parse(savedUiState);
                        setIsNameRegistered(ui.isNameRegistered ?? false);
                        setCurrentStep(ui.currentStep ?? 0);
                    }

                    logger.info("Restored form data and UI state after Clerk sign-in");
                } catch (e) {
                    console.error("Failed to restore form data", e);
                }
            }
            // Clear flags
            sessionStorage.removeItem("clerk_signin_started");
            sessionStorage.removeItem("welcome_form_draft");
            sessionStorage.removeItem("welcome_form_ui_state");
        }
    }, [user, reset, setValue]);

    const { triggerPhoneClear } = usePhoneClear();

    // Watch all fields for live preview
    const formValues = watch();

    // Sync email if user changes (for initial load or if user logs in via header)
    useEffect(() => {
        if (user?.email) {
            setValue("ownerEmail", user.email);
        }
    }, [user, setValue]);

    const editField = (field: keyof SchoolFormData, goToStep?: (stepIndex: number) => void) => {
        const targetIdx = WELCOME_SCHOOL_STEPS.findIndex((s) => s.fields?.includes(field));
        if (targetIdx >= 0) {
            // Navigate to the step first
            if (goToStep) {
                goToStep(targetIdx);
            }
            // Then focus the field
            setTimeout(() => {
                try {
                    setFocus(field as any);
                } catch {}
            }, 100);
        }
    };

    const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        const currentValues = methods.watch();
        if (name && !currentValues.username) {
            setIsGeneratingUsername(true);
            try {
                // Simulate minimal delay for UX
                await new Promise((resolve) => setTimeout(resolve, 300));

                const baseUsername = generateUsername(name);
                const finalUsername = generateUsernameVariants(baseUsername, existingUsernames);
                setValue("username", finalUsername);
                setUsernameStatus("available");
            } catch (error) {
                logger.error("Error generating username", error);
            } finally {
                setIsGeneratingUsername(false);
            }
        }
    };

    const handleUsernameChange = () => {
        // Clear status while typing to avoid confusion
        if (usernameStatus !== null) {
            setUsernameStatus(null);
        }
    };

    const handleUsernameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const username = e.target.value.trim();
        if (!username) {
            setUsernameStatus(null);
            return;
        }

        setUsernameStatus("checking");
        try {
            // 1. Local Check (Reserved Names)
            if (isUsernameReserved(username)) {
                setUsernameStatus("unavailable");
                return;
            }

            // 2. Local Check (Existing list from server)
            const normalizedUsername = username.toLowerCase();
            const normalizedExisting = existingUsernames.map((u) => u?.toLowerCase() || "");
            if (normalizedExisting.includes(normalizedUsername)) {
                setUsernameStatus("unavailable");
                return;
            }

            // 3. Server Check (Query whole school table for extra safety)
            const result = await checkUsernameAvailability(username);
            if (result.success && result.data === true) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("unavailable");
            }
        } catch (error) {
            logger.error("Error checking username availability", error);
            setUsernameStatus(null);
        }
    };

    const handleLocationChange = useCallback(
        (location: { latitude?: number; longitude?: number; googlePlaceId?: string; timezone?: string }) => {
            if (location.latitude !== undefined) setValue("latitude", location.latitude);
            if (location.longitude !== undefined) setValue("longitude", location.longitude);
            if (location.googlePlaceId) setValue("googlePlaceId", location.googlePlaceId);
            setValue("timezone", location.timezone || "");
        },
        [setValue],
    );

    const handleCountryChange = useCallback(
        (country: string) => {
            setValue("country", country);
        },
        [setValue],
    );

    const handlePhoneChange = useCallback(
        (phone: string) => {
            setValue("phone", phone);
        },
        [setValue],
    );

    const triggerUpload = async (data: SchoolFormData) => {
        if (uploadStarted) return;
        if (!data.iconFile && !data.bannerFile) return;

        setPendingToBucket(true);
        setUploadStarted(true);
        setUploadStatus("Uploading assets in background...");
        logger.info("Starting background upload of assets to R2");

        try {
            const formData = new FormData();
            formData.append("username", data.username);

            // Add metadata for bucket storage
            const metadata: BucketMetadata = {
                school_username: data.username,
                school_name: data.name,
                owner_email: data.ownerEmail,
                reference_note: data.referenceNote,
                created_at: new Date().toISOString(),
                approved_at: null,
                welcome_form: "created",
            };
            formData.append("metadata", JSON.stringify(metadata));

            if (data.iconFile) {
                formData.append("iconFile", data.iconFile);
            }
            if (data.bannerFile) {
                formData.append("bannerFile", data.bannerFile);
            }

            // Non-blocking upload request
            fetch("/api/cloudflare/upload", {
                method: "POST",
                body: formData,
            })
                .then(async (res) => {
                    const result = await res.json();
                    if (result.success) {
                        logger.info("Background upload success", { uploaded: result.uploaded });
                        setUploadStatus("Upload complete");
                    } else {
                        logger.error("Background upload failed", result.error);
                        setUploadStatus("Upload failed");
                        // Allow retry if needed
                        setUploadStarted(false);
                    }
                    setPendingToBucket(false);
                })
                .catch((err) => {
                    logger.error("Background upload network error", err);
                    setUploadStatus("Upload network error");
                    setPendingToBucket(false);
                    setUploadStarted(false);
                });
        } catch (e) {
            logger.error("Error triggering upload", e);
            setPendingToBucket(false);
            setUploadStarted(false);
        }
    };

    const handleStepChange = (newStep: number) => {
        setCurrentStep(newStep);

        // Assets step is now index 0. If we move to step 1 (Social), trigger upload.
        if (newStep > 0) {
            const data = methods.getValues();
            triggerUpload(data);
        }
    };

    const onSubmit = async (data: SchoolFormData) => {
        if (!user) {
            logger.error("Submission attempted without authenticated user");
            return;
        }

        // Prevent double submission
        if (isSubmitting) {
            logger.debug("Submission already in progress, ignoring duplicate submit");
            return;
        }

        setIsSubmitting(true);
        try {
            // Ensure upload started if it hasn't (fallback)
            if (!uploadStarted) {
                triggerUpload(data);
            }

            // Step 2: Prepare school data
            const schoolData = {
                ...data,
                email: data.ownerEmail,
                clerkId: user.id, // Use actual user.id instead of random generation
                equipmentCategories: data.equipmentCategories.join(","),
                latitude: data.latitude?.toString(),
                longitude: data.longitude?.toString(),
                instagramUrl:
                    data.instagramUrl && !data.instagramUrl.includes("instagram.com")
                        ? `https://www.instagram.com/${data.instagramUrl.replace(/^@/, "")}`
                        : data.instagramUrl,
                // Remove file objects before sending to database
                iconFile: undefined,
                bannerFile: undefined,
            };

            // Step 3: Create school in database
            setUploadStatus("Creating school...");
            logger.info("Creating school in database");
            const result = await createSchool(schoolData);

            if (!result.success) {
                logger.error("Database error creating school", undefined, { error: result.error });

                // Throw error to prevent success page
                throw new Error(`Failed to create school: ${result.error}`);
            }

            logger.info("School created successfully", { schoolId: result.data?.id });

            // Save username for the success button redirect
            setCreatedSchoolUsername(data.username);

            // We do NOT reset the form here, so MultiFormContainer can show the success view.
            // The redirection happens when the user clicks the success button.

            setPendingToBucket(false);
            setUploadStatus("");
            setUploadStarted(false);
            setIsSubmitting(false);
        } catch (error) {
            logger.error("Error in school creation flow", error);
            setUploadStatus("");
            setIsSubmitting(false);

            // Show timeout handler for R2 connectivity issues if it was an upload related error (though upload is now backgrounded, main flow might still have DB errors)
            if (
                error instanceof Error &&
                (error.message.includes("timeout") ||
                    error.message.includes("ETIMEDOUT") ||
                    error.message.includes("upload") ||
                    error.message.includes("Failed to upload assets"))
            ) {
                logger.warn("R2/DB failed, showing timeout handler");
                setTimeoutFormData(data);
                setShowTimeoutHandler(true);
            }

            // Rethrow error so MultiFormContainer shows the error state
            throw error;
        }
    };

    // Step configuration (0-based indexing for array steps)
    const stepComponents = {
        0: AssetsStep,
        1: SocialStep,
        2: IdentificationStep,
        3: CategoriesStep,
        4: SummaryStep,
    };

    const stepSubtitles = {
        0: "Make your school stand out",
        1: "Connect with your community",
        2: "Who is the owner?",
        3: "What Adrenaline Activity do you have to offer?",
        4: "Does everything look correct, admin?",
    };

    const stepProps = {
        0: {
            pendingToBucket,
            uploadStatus,
            onCountryChange: handleCountryChange,
            onLocationChange: handleLocationChange,
        },
        1: {
            onPhoneChange: handlePhoneChange,
        },
        2: { user },
        3: {},
        4: {
            onEditField: editField,
            user,
        },
    };

    const isLastStep = currentStep === WELCOME_SCHOOL_STEPS.length - 1;
    const isSubmitDisabled = isLastStep && !user;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-16 md:space-y-24">
            {/* Live Header Preview - Always visible to encourage completion */}
            {!isResultView && (
                <div className="mb-4 md:mb-8">
                    <WelcomeHeader formData={formValues} showPreview={isNameRegistered} />
                </div>
            )}

            {!isNameRegistered ? (
                <>
                    <WelcomeSchoolNameRegistration
                        formMethods={methods}
                        isGeneratingUsername={isGeneratingUsername}
                        usernameStatus={usernameStatus}
                        onNameBlur={handleNameBlur}
                        onUsernameChange={handleUsernameChange}
                        onUsernameBlur={handleUsernameBlur}
                        onNext={() => {
                            setIsNameRegistered(true);
                        }}
                        onCurrencyChange={(currency) => setValue("currency", currency)}
                        user={user}
                    />
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
                    >
                        <div className="w-full backdrop-blur-xl bg-background/80 border-t border-border/40 pointer-events-auto shadow-2xl">
                            <div className="container mx-auto px-4">
                                <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                            Home of Adrenaline Activity
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-border/20">
                                        <span className="hidden md:inline text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                            Change the Wind
                                        </span>
                                        <WindToggle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : (
                <MultiFormContainer<SchoolFormData>
                    steps={WELCOME_SCHOOL_STEPS}
                    formMethods={methods}
                    onSubmit={onSubmit}
                    onStepChange={handleStepChange}
                    stepComponents={stepComponents}
                    stepProps={stepProps}
                    stepSubtitles={stepSubtitles}
                    submitButtonText="Start Your Adventure"
                    successTitle="Congratulations"
                    successMessage="Your School Application was receieved."
                    successButtonText="Navigate Away"
                    onSuccessButtonClick={() => {
                        const targetUsername = createdSchoolUsername || methods.getValues("username");
                        window.location.href = `https://${targetUsername}.adrenalink.tech/`;
                    }}
                    onStateChange={(state) => setIsResultView(state.isSubmitted || state.isError)}
                    isNextDisabled={isSubmitDisabled}
                />
            )}

            {showTimeoutHandler && timeoutFormData && (
                <HandleFormTimeOut
                    formData={timeoutFormData}
                    onClose={() => {
                        setShowTimeoutHandler(false);
                        setTimeoutFormData(null);
                    }}
                />
            )}
        </div>
    );
}
