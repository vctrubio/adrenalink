"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormSubmit } from "@/src/components/ui/form";
import { CountryFlagPhoneSubForm } from "./CountryFlagPhoneSubForm";
import { createSchool, getSchoolsUsernames, checkUsernameAvailability } from "@/actions/schools-action";
import { usePhoneClear } from "@/src/hooks/usePhoneClear";
import { isUsernameReserved } from "@/config/predefinedNames";

const schoolSchema = z.object({
    name: z.string().min(1, "School name is required"),
    username: z
        .string()
        .min(1, "Username is required")
        .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
        .refine((username) => !isUsernameReserved(username), { message: "This username is reserved and cannot be used" }),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

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
    const methods = useForm<SchoolFormData>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            name: "",
            username: "",
            country: "",
            phone: "",
        },
    });

    const {
        register,
        formState: { errors },
        setValue,
        watch,
    } = methods;
    const countryValue = watch("country");
    const phoneValue = watch("phone");
    const usernameValue = watch("username");
    const nameValue = watch("name");
    const { clearPhone, triggerPhoneClear } = usePhoneClear();
    const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<"available" | "unavailable" | "checking" | null>(null);

    const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        if (name && !usernameValue) {
            setIsGeneratingUsername(true);
            try {
                const usernames = await getSchoolsUsernames();
                if (usernames.success) {
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

    const onSubmit = async (data: SchoolFormData) => {
        try {
            await createSchool(data);
            // Preserve the last used country when resetting
            const lastCountry = data.country;
            methods.reset();
            setValue("country", lastCountry);
            triggerPhoneClear();
            // Add success notification here if needed
        } catch (error) {
            console.error("Error creating school:", error);
            // Add error notification here if needed
        }
    };

    return (
        <Form methods={methods} onSubmit={onSubmit} className="bg-card border-border rounded-lg shadow-sm">
            <div className="space-y-6">
                <FormField label="School Name" required error={errors.name?.message} isValid={!errors.name && nameValue && nameValue.length > 0}>
                    <FormInput {...register("name")} placeholder="Enter school name" error={!!errors.name} onBlur={handleNameBlur} />
                </FormField>

                <FormField label="Username" required error={errors.username?.message} isValid={!errors.username && usernameValue && usernameValue.length > 0 && usernameStatus === "available"}>
                    <div className="relative">
                        <FormInput
                            {...register("username", { onChange: handleUsernameChange })}
                            placeholder={isGeneratingUsername ? "Generating username..." : "Generated from school name"}
                            error={!!errors.username}
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

                <div>
                    <CountryFlagPhoneSubForm
                        onCountryChange={(country) => setValue("country", country)}
                        onPhoneChange={(phone) => setValue("phone", phone)}
                        countryValue={countryValue}
                        countryError={errors.country?.message}
                        phoneError={errors.phone?.message}
                        onClearPhone={clearPhone}
                        countryIsValid={!errors.country && countryValue && countryValue.length > 0}
                        phoneIsValid={!errors.phone && phoneValue && phoneValue.length > 3}
                    />
                </div>

                <FormSubmit color="#6366f1">Create School</FormSubmit>
            </div>
        </Form>
    );
}
