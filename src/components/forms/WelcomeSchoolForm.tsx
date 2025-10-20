"use client";

import { useForm } from "react-hook-form";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormSubmit, FormButton } from "@/src/components/ui/form";
import { createSchool, getSchoolsUsernames, checkUsernameAvailability } from "@/actions/schools-action";
import { usePhoneClear } from "@/src/hooks/usePhoneClear";
import { isUsernameReserved } from "@/config/predefinedNames";
import { CheckCircle2, Circle, MapPin, Building, Tag, Pencil } from "lucide-react";
import { LocationStep } from "./LocationStep";

// Step 1: Name schema
const nameSchema = z.object({
    name: z.string().min(1, "School name is required"),
    username: z
        .string()
        .min(1, "Username is required")
        .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
        .refine((username) => !isUsernameReserved(username), { message: "This username is reserved and cannot be used" }),
});

// Step 2: Location schema
const locationSchema = z.object({
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googlePlaceId: z.string().optional(),
});

// Step 3: Categories schema
const EQUIPMENT_CATEGORIES = ["kite", "wing", "windsurf", "surf", "snowboard"] as const;
const categoriesSchema = z.object({
    equipmentCategories: z.array(z.enum(EQUIPMENT_CATEGORIES)).min(1, "Select at least one equipment category"),
});

const schoolSchema = nameSchema.merge(locationSchema).merge(categoriesSchema);

type SchoolFormData = z.infer<typeof schoolSchema>;

type Step = {
    id: number;
    title: string;
    icon: React.ReactNode;
    fields: (keyof SchoolFormData)[];
};

const STEPS: Step[] = [
    { id: 1, title: "Name", icon: <Building className="w-4 h-4" />, fields: ["name", "username"] },
    { id: 2, title: "Location", icon: <MapPin className="w-4 h-4" />, fields: ["country", "phone", "latitude", "longitude", "googlePlaceId"] },
    { id: 3, title: "Categories", icon: <Tag className="w-4 h-4" />, fields: ["equipmentCategories"] },
    { id: 4, title: "Summary", icon: <CheckCircle2 className="w-4 h-4" />, fields: [] },
];

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
    const [stepIndex, setStepIndex] = useState(0);
    const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<"available" | "unavailable" | "checking" | null>(null);

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
        },
        mode: "onTouched",
    });

    const {
        register,
        formState: { errors },
        setValue,
        watch,
        trigger,
        handleSubmit,
        setFocus,
    } = methods;

    const values = watch();
    const { clearPhone, triggerPhoneClear } = usePhoneClear();

    const progress = useMemo(() => (stepIndex / (STEPS.length - 1)) * 100, [stepIndex]);

    // Navigation functions
    const next = async () => {
        const currentFields = STEPS[stepIndex].fields;
        const isValid = currentFields.length === 0 ? true : await trigger(currentFields as any);
        if (isValid && stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    };

    const prev = () => setStepIndex((i) => Math.max(0, i - 1));

    const goTo = (idx: number) => setStepIndex(idx);

    const editField = (field: keyof SchoolFormData) => {
        const targetIdx = STEPS.findIndex((s) => s.fields.includes(field));
        if (targetIdx >= 0) {
            goTo(targetIdx);
            setTimeout(() => {
                try {
                    setFocus(field as any);
                } catch { }
            }, 60);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle Enter key events and avoid interfering with form elements
            if (e.key === "Enter" && !(e.target as HTMLElement).closest("button, [type=submit]")) {
                e.preventDefault();

                if (e.shiftKey) {
                    prev();
                } else {
                    next();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        if (name && !values.username) {
            setIsGeneratingUsername(true);
            try {
                const usernames = await getSchoolsUsernames();
                if (usernames.success && usernames.data) {
                    const baseUsername = generateUsername(name);
                    const finalUsername = generateUsernameVariants(baseUsername, usernames.data);
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
                    setUsernameStatus(result.available ? "available" : "unavailable");
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

    const onSubmit = async (data: SchoolFormData) => {
        try {
            // Convert equipmentCategories array to comma-separated string for database
            const schoolData = {
                ...data,
                equipmentCategories: data.equipmentCategories.join(","),
            };

            const result = await createSchool(schoolData);

            // Check if the result has an error property
            if (result && "error" in result) {
                console.error("Error creating school:", result.error);
                // Add error notification here if needed
                return;
            }

            // Check for success
            if (result && "success" in result && result.success) {
                console.log("✅ School created successfully:", result.data);
            } else {
                console.log("✅ School created successfully:", result);
            }
            const lastCountry = data.country;
            methods.reset();
            setValue("country", lastCountry);
            triggerPhoneClear();
            setStepIndex(0);
            setUsernameStatus(null);
            // Add success notification here if needed
        } catch (error) {
            console.error("Error creating school:", error);
            // Add error notification here if needed
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-3xl md:text-4xl font-bold">Start Your Adventure</h1>
                <p className="text-muted-foreground mt-1">Register your Adrenaline School with Us.</p>
            </div>

            {/* Stepper */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between gap-2">
                    {STEPS.map((s, idx) => {
                        const complete = idx < stepIndex;
                        const active = idx === stepIndex;
                        return (
                            <button key={s.id} type="button" onClick={() => goTo(idx)} className="flex-1 group" aria-current={active}>
                                <div
                                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md border text-sm
                                    ${active ? "border-ring bg-accent/40" : complete ? "border-secondary bg-secondary/10" : "border-border"}
                                `}
                                >
                                    <span
                                        className={`rounded-full w-6 h-6 flex items-center justify-center
                                        ${complete ? "bg-secondary text-secondary-foreground" : active ? "bg-ring/10 text-ring" : "bg-muted text-muted-foreground"}
                                    `}
                                    >
                                        {complete ? <CheckCircle2 className="w-4 h-4" /> : active ? <Circle className="w-3 h-3" /> : s.icon}
                                    </span>
                                    <span className={`hidden md:inline ${active ? "font-semibold" : ""}`}>{s.title}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="relative mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-tertiary to-secondary transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Form */}
            <Form methods={methods} onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-lg border border-border p-6 md:p-8">
                {/* Step 1: Name */}
                {stepIndex === 0 && (
                    <div className="space-y-6">
                        <FormField label="School Name" required error={errors.name?.message} isValid={!errors.name && !!values.name && values.name.length > 0}>
                            <FormInput {...register("name")} placeholder="Enter school name" autoFocus onBlur={handleNameBlur} />
                        </FormField>

                        <FormField label="Username" required error={errors.username?.message} isValid={!errors.username && !!values.username && values.username.length > 0 && usernameStatus === "available"}>
                            <div className="relative">
                                <FormInput
                                    {...register("username", { onChange: handleUsernameChange })}
                                    placeholder={isGeneratingUsername ? "Generating username..." : "school.adrenaline.com"}
                                    disabled={isGeneratingUsername}
                                    className={`
                                        ${isGeneratingUsername ? "animate-pulse" : ""}
                                        ${usernameStatus === "available" ? "border-secondary focus:ring-secondary" : ""}
                                        ${usernameStatus === "unavailable" ? "border-warning focus:ring-warning" : ""}
                                    `}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                    {isGeneratingUsername && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                                    {usernameStatus === "checking" && !isGeneratingUsername && <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>}
                                    {usernameStatus === "available" && (
                                        <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                    {usernameStatus === "unavailable" && (
                                        <div className="w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M6 2L2 6M2 2L6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormField>
                    </div>
                )}

                {/* Step 2: Location */}
                {stepIndex === 1 && (
                    <LocationStep
                        country={values.country}
                        phone={values.phone}
                        latitude={values.latitude}
                        longitude={values.longitude}
                        googlePlaceId={values.googlePlaceId}
                        countryError={errors.country?.message}
                        phoneError={errors.phone?.message}
                        onCountryChange={handleCountryChange}
                        onPhoneChange={handlePhoneChange}
                        onLocationChange={handleLocationChange}
                        triggerPhoneClear={triggerPhoneClear}
                    />
                )}

                {/* Step 3: Categories */}
                {stepIndex === 2 && (
                    <div className="space-y-4">
                        <FormField label="Equipment Categories" required error={errors.equipmentCategories?.message as string | undefined} isValid={Array.isArray(values.equipmentCategories) && values.equipmentCategories.length > 0}>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {EQUIPMENT_CATEGORIES.map((cat) => {
                                    const checked = values.equipmentCategories?.includes(cat);
                                    return (
                                        <label
                                            key={cat}
                                            className={`cursor-pointer select-none border rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors
                                            ${checked ? "bg-secondary text-secondary-foreground border-secondary" : "bg-background border-input hover:bg-accent"}
                                        `}
                                        >
                                            <input type="checkbox" value={cat} className="hidden" {...register("equipmentCategories")} />
                                            <span className="capitalize">{cat}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </FormField>
                    </div>
                )}

                {/* Step 4: Summary */}
                {stepIndex === 3 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative p-4 rounded-md border bg-background">
                                <button type="button" aria-label="Edit school name" onClick={() => editField("name")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <div className="text-xs text-muted-foreground mb-1">School Name</div>
                                <div className="font-medium">{values.name || "—"}</div>
                            </div>
                            <div className="relative p-4 rounded-md border bg-background">
                                <button type="button" aria-label="Edit username" onClick={() => editField("username")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <div className="text-xs text-muted-foreground mb-1">Username</div>
                                <div className="font-medium">{values.username || "—"}</div>
                            </div>
                            <div className="relative p-4 rounded-md border bg-background">
                                <button type="button" aria-label="Edit country" onClick={() => editField("country")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <div className="text-xs text-muted-foreground mb-1">Country</div>
                                <div className="font-medium">{values.country || "—"}</div>
                            </div>
                            <div className="relative p-4 rounded-md border bg-background">
                                <button type="button" aria-label="Edit phone" onClick={() => editField("phone")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <div className="text-xs text-muted-foreground mb-1">Phone</div>
                                <div className="font-medium">{values.phone || "—"}</div>
                            </div>
                            <div className="relative p-4 rounded-md border bg-background md:col-span-2">
                                <button type="button" aria-label="Edit categories" onClick={() => editField("equipmentCategories")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <div className="text-xs text-muted-foreground mb-1">Equipment Categories</div>
                                <div className="font-medium">{values.equipmentCategories?.length ? values.equipmentCategories.join(", ") : "—"}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">
                            <FormButton type="button" variant="secondary" onClick={() => goTo(0)}>
                                Edit name
                            </FormButton>
                            <FormButton type="button" variant="secondary" onClick={() => goTo(1)}>
                                Edit location
                            </FormButton>
                            <FormButton type="button" variant="secondary" onClick={() => goTo(2)}>
                                Edit categories
                            </FormButton>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                    <FormButton type="button" variant="tertiary" disabled={stepIndex === 0} onClick={prev}>
                        Back
                    </FormButton>

                    {stepIndex < STEPS.length - 1 ? (
                        <FormButton type="button" variant="primary" onClick={next}>
                            Next
                        </FormButton>
                    ) : (
                        <FormSubmit color="#6366f1">Create School</FormSubmit>
                    )}
                </div>
            </Form>
        </div>
    );
}
