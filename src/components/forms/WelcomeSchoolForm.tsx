"use client";

import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSchool, getSchoolsUsernames, checkUsernameAvailability } from "@/actions/schools-action";
import { usePhoneClear } from "@/src/hooks/usePhoneClear";
import { isUsernameReserved } from "@/config/predefinedNames";
// Removed R2 upload utility - now using API route
import { MultiFormContainer } from "./multi";
import { DetailsStep, CategoriesStep, AssetsStep, ContactStep, SummaryStep, WELCOME_SCHOOL_STEPS, type SchoolFormData } from "./WelcomeSchoolSteps";
import { WelcomeHeader } from "./WelcomeHeader";
import { WelcomeSchoolNameRegistration } from "./WelcomeSchoolNameRegistration";
import type { BucketMetadata } from "@/types/cloudflare-form-metadata";
import { HandleFormTimeOut } from "./HandleFormTimeOut";

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
    googlePlaceId: z.string().optional(),
    equipmentCategories: z.array(z.enum(["kite", "wing", "windsurf"])).min(1, "Select at least one equipment category"),
    iconFile: z.instanceof(File, { message: "Icon file is required" }).refine(
        (file) => file && file.type.startsWith("image/"),
        "Icon must be an image file"
    ),
    bannerFile: z.instanceof(File, { message: "Banner file is required" }).refine(
        (file) => file && file.type.startsWith("image/"),
        "Banner must be an image file"
    ),
    ownerEmail: z.string().email("Valid email is required"),
    referenceNote: z.string().optional(),
    websiteUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    currency: z.enum(["USD", "EUR", "CHF"]).default("EUR"),
});

// Username generation utilities
function generateUsername(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 30);
}

function generateUsernameVariants(baseUsername: string, existingUsernames: string[]): string {
    if (!existingUsernames.includes(baseUsername) && !isUsernameReserved(baseUsername)) {
        return baseUsername;
    }

    for (let i = 1; i <= 999; i++) {
        const variant = `${baseUsername}${i}`;
        if (!existingUsernames.includes(variant) && !isUsernameReserved(variant)) {
            return variant;
        }
    }

    return `${baseUsername}${Date.now().toString().slice(-6)}`;
}

export function WelcomeSchoolForm() {
    const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<"available" | "unavailable" | "checking" | null>(null);
    const [pendingToBucket, setPendingToBucket] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [showTimeoutHandler, setShowTimeoutHandler] = useState(false);
    const [timeoutFormData, setTimeoutFormData] = useState<SchoolFormData | null>(null);
    const [uploadStarted, setUploadStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isNameRegistered, setIsNameRegistered] = useState(false);

    const methods = useForm<SchoolFormData>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            name: "",
            username: "",
            country: "",
            phone: "",
            latitude: undefined,
            longitude: undefined,
            googlePlaceId: "",
            equipmentCategories: [],
            iconFile: undefined,
            bannerFile: undefined,
            ownerEmail: "",
            referenceNote: "",
            websiteUrl: "",
            instagramUrl: "",
            currency: "EUR",
        },
        mode: "onTouched",
    });

    const { setValue, setFocus, watch } = methods;
    const { triggerPhoneClear } = usePhoneClear();
    
    // Watch all fields for live preview
    const formValues = watch();

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
                } catch { }
            }, 100);
        }
    };

    const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        const currentValues = methods.watch();
        if (name && !currentValues.username) {
            setIsGeneratingUsername(true);
            try {
                const result = await getSchoolsUsernames();
                if (result.success) {
                    const baseUsername = generateUsername(name);
                    const finalUsername = generateUsernameVariants(baseUsername, result.data);
                    setValue("username", finalUsername);
                    setUsernameStatus("available");
                }
            } catch (error) {
                console.error("Error generating username:", error);
            } finally {
                setIsGeneratingUsername(false);
            }
        }
    };

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const username = e.target.value;
        if (username && username.length > 0) {
            setUsernameStatus("checking");
            try {
                if (isUsernameReserved(username)) {
                    setUsernameStatus("unavailable");
                    return;
                }

                const result = await checkUsernameAvailability(username);
                if (result.success) {
                    setUsernameStatus(result.data ? "available" : "unavailable");
                }
            } catch (error) {
                console.error("Error checking username:", error);
                setUsernameStatus(null);
            }
        } else {
            setUsernameStatus(null);
        }
    };

    const handleLocationChange = useCallback(
        (location: { latitude?: number; longitude?: number; googlePlaceId?: string }) => {
            if (location.latitude !== undefined) setValue("latitude", location.latitude);
            if (location.longitude !== undefined) setValue("longitude", location.longitude);
            if (location.googlePlaceId) setValue("googlePlaceId", location.googlePlaceId);
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
        console.log("📤 Starting background upload of assets to R2...");

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
                        console.log("✅ Background upload success:", result.uploaded);
                        setUploadStatus("Upload complete");
                    } else {
                        console.error("❌ Background upload failed:", result.error);
                        setUploadStatus("Upload failed");
                        // Allow retry if needed
                        setUploadStarted(false);
                    }
                    setPendingToBucket(false);
                })
                .catch((err) => {
                    console.error("❌ Background upload network error:", err);
                    setUploadStatus("Upload network error");
                    setPendingToBucket(false);
                    setUploadStarted(false);
                });
        } catch (e) {
            console.error("Error triggering upload:", e);
            setPendingToBucket(false);
            setUploadStarted(false);
        }
    };

    const handleStepChange = (newStep: number) => {
        setCurrentStep(newStep);
        
        // Assets step is now index 0. If we move to step 1 (Details) or higher, trigger upload.
        if (newStep > 0) {
            const data = methods.getValues();
            triggerUpload(data);
        }
    };

    const onSubmit = async (data: SchoolFormData) => {
        try {
            // Ensure upload started if it hasn't (fallback)
            if (!uploadStarted) {
                triggerUpload(data);
            }

            // Step 2: Prepare school data (no longer storing asset URLs)
            const schoolData = {
                ...data,
                equipmentCategories: data.equipmentCategories.join(","),
                // Remove file objects before sending to database
                iconFile: undefined,
                bannerFile: undefined,
            };

            // Step 3: Create school in database
            setUploadStatus("Creating school...");
            console.log("💾 Creating school in database...");
            const result = await createSchool(schoolData);

            if (!result.success) {
                console.error("❌ Database error:", result.error);
                
                // Throw error to prevent success page
                throw new Error(`Failed to create school: ${result.error}`);
            }

            console.log("✅ School created successfully:", result.data);

            // Direct redirect to production subdomain
            window.location.href = `https://${data.username}.adrenalink.tech/`;

            // Reset logic (fallback if redirect takes time)
            const lastCountry = data.country;
            methods.reset();
            setValue("country", lastCountry);
            triggerPhoneClear();
            setUsernameStatus(null);
            setPendingToBucket(false);
            setUploadStatus("");
            setUploadStarted(false);
            setCurrentStep(0);
            setIsNameRegistered(false);
        } catch (error) {
            console.error("Error in school creation flow:", error);
            setUploadStatus("");
            
            // Show timeout handler for R2 connectivity issues if it was an upload related error (though upload is now backgrounded, main flow might still have DB errors)
            if (error instanceof Error && (
                error.message.includes("timeout") ||
                error.message.includes("ETIMEDOUT") ||
                error.message.includes("upload") ||
                error.message.includes("Failed to upload assets")
            )) {
                console.log("🔄 R2/DB failed, showing timeout handler");
                setTimeoutFormData(data);
                setShowTimeoutHandler(true);
            }
        }
    };

    // Step configuration (0-based indexing for array steps)
    const stepComponents = {
        0: AssetsStep,
        1: DetailsStep,
        2: CategoriesStep,
        3: ContactStep,
        4: SummaryStep,
    };

    const stepSubtitles = {
        0: "Make your school stand out",
        1: "How can students find you?",
        2: "What do you have to offer?",
        3: "How can we reach you?",
        4: "Does everything look correct officer?",
    };

    const stepProps = {
        0: {
            pendingToBucket,
            uploadStatus,
        },
        1: {
            onCountryChange: handleCountryChange,
            onPhoneChange: handlePhoneChange,
            onLocationChange: handleLocationChange,
            triggerPhoneClear,
        },
        2: {},
        3: {},
        4: {
            onEditField: editField,
        },
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Live Header Preview - Always visible to encourage completion */}
            <WelcomeHeader formData={formValues} showPreview={isNameRegistered} />

            {!isNameRegistered ? (
                <WelcomeSchoolNameRegistration
                    formMethods={methods}
                    isGeneratingUsername={isGeneratingUsername}
                    usernameStatus={usernameStatus}
                    onNameBlur={handleNameBlur}
                    onUsernameChange={handleUsernameChange}
                    onNext={() => {
                        console.log("🔄 Transitioning to multi-form...");
                        setIsNameRegistered(true);
                    }}
                />
            ) : (
                <MultiFormContainer<SchoolFormData>
                    steps={WELCOME_SCHOOL_STEPS}
                    formMethods={methods}
                    onSubmit={onSubmit}
                    onStepChange={handleStepChange}
                    stepComponents={stepComponents}
                    stepProps={stepProps}
                    stepSubtitles={stepSubtitles}
                    submitButtonText="Create School"
                    successTitle="Congratulations"
                    successMessage="We will get back to you in 1 business day. Thank you."
                    successButtonText="Go to School"
                    onSuccessButtonClick={() => {
                        const username = methods.getValues("username");
                        window.location.href = `https://${username}.adrenalink.tech/`;
                    }}
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