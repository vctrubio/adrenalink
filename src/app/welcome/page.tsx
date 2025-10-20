"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormButton } from "../../components/ui/form";
import { CountryFlagPhoneSubForm } from "../../components/forms/CountryFlagPhoneSubForm";
import { CheckCircle2, Circle, Link2, ListChecks, User, Pencil, Rocket } from "lucide-react";

// Step 1: Welcome schema
const welcomeSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    fullName: z.string().min(5, "Full name must be at least 5 characters"),
    country: z.string().min(2, "Please select a country"),
    phoneNumber: z.string().min(9, "Phone number must be at least 9 digits"),
});

// Step 2: Interests schema (multi-select)
const EQUIPMENT_CATEGORIES = ["kite", "wing", "windsurf", "surf", "snowboard"] as const;
const interestedSchema = z.object({
    interests: z.array(z.enum(EQUIPMENT_CATEGORIES)).min(1, "Select at least one sport"),
});

// Step 3: Links schema
const linksSchema = z.object({
    websiteURL: z
        .string()
        .trim()
        .optional()
        .transform((v) => (v ? v : undefined))
        .pipe(z.string().url("Enter a valid URL").optional()),
    socialURL: z
        .string()
        .trim()
        .optional()
        .transform((v) => (v ? v : undefined))
        .pipe(z.string().url("Enter a valid URL").optional()),
});

const formSchema = welcomeSchema.merge(interestedSchema).merge(linksSchema);

type FormData = z.infer<typeof formSchema>;

type Step = {
    id: number;
    title: string;
    icon: React.ReactNode;
    fields: (keyof FormData)[];
};

const STEPS: Step[] = [
    { id: 1, title: "Welcome", icon: <User className="w-4 h-4" />, fields: ["firstName", "fullName", "country", "phoneNumber"] },
    { id: 2, title: "Interests", icon: <ListChecks className="w-4 h-4" />, fields: ["interests"] },
    { id: 3, title: "Links", icon: <Link2 className="w-4 h-4" />, fields: ["websiteURL", "socialURL"] },
    { id: 4, title: "Summary", icon: <CheckCircle2 className="w-4 h-4" />, fields: [] },
];

export default function WelcomePage() {
    const [stepIndex, setStepIndex] = useState(0);

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            fullName: "",
            country: "",
            phoneNumber: "",
            interests: [],
            websiteURL: "",
            socialURL: "",
        },
        mode: "onTouched",
    });

    const {
        register,
        watch,
        setValue,
        trigger,
        formState: { errors },
        handleSubmit,
        setFocus,
    } = methods;

    const values = watch();

    const progress = useMemo(() => ((stepIndex) / (STEPS.length - 1)) * 100, [stepIndex]);

    const next = async () => {
        // Validate only the current step's fields before advancing
        const currentFields = STEPS[stepIndex].fields;
        const isValid = currentFields.length === 0 ? true : await trigger(currentFields as any);
        if (isValid && stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    };

    const prev = () => setStepIndex((i) => Math.max(0, i - 1));

    const goTo = (idx: number) => setStepIndex(idx);

    const editField = (field: keyof FormData) => {
        const targetIdx = STEPS.findIndex((s) => s.fields.includes(field));
        if (targetIdx >= 0) {
            goTo(targetIdx);
            setTimeout(() => {
                try {
                    setFocus(field as any);
                } catch {}
            }, 60);
        }
    };

    const onSubmit = (data: FormData) => {
        // Final submit after summary
        console.log("Welcome form submit:", data);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Welcome</h1>
                    <p className="text-muted-foreground mt-1">A quick 3-step setup and a final review</p>
                </div>

                {/* Stepper */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-6">
                    <div className="flex items-center justify-between gap-2">
                        {STEPS.map((s, idx) => {
                            const complete = idx < stepIndex;
                            const active = idx === stepIndex;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => goTo(idx)}
                                    className={"flex-1 group"}
                                    aria-current={active}
                                >
                                    <div className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md border text-sm
                                        ${active ? "border-ring bg-accent/40" : complete ? "border-secondary bg-secondary/10" : "border-border"}
                                    `}>
                                        <span className={`rounded-full w-6 h-6 flex items-center justify-center
                                            ${complete ? "bg-secondary text-secondary-foreground" : active ? "bg-ring/10 text-ring" : "bg-muted text-muted-foreground"}
                                        `}>
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
                        <div className="absolute -top-2" style={{ left: `calc(${progress}% - 12px)` }}>
                            <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                                <Rocket className="w-3.5 h-3.5 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-center gap-3 text-xs">
                        {STEPS.map((s, idx) => (
                            <div key={s.id} className={`flex items-center gap-2 ${idx === stepIndex ? "text-foreground" : idx < stepIndex ? "text-secondary" : "text-muted-foreground"}`}>
                                <span className="hidden md:inline">{s.title}</span>
                                {idx < STEPS.length - 1 && <span className="text-muted-foreground">·</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <Form methods={methods} onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-lg border border-border p-6 md:p-8">
                    {/* Step 1: Welcome */}
                    {stepIndex === 0 && (
                        <div className="space-y-6">
                            <FormField label="First name" required error={errors.firstName?.message} isValid={!errors.firstName && !!values.firstName && values.firstName.length >= 2}>
                                <FormInput {...register("firstName")} placeholder="e.g. Sam" autoFocus />
                            </FormField>

                            <FormField label="Full name" required error={errors.fullName?.message} isValid={!errors.fullName && !!values.fullName && values.fullName.length >= 5}>
                                <FormInput {...register("fullName")} placeholder="e.g. Sam Altman" />
                            </FormField>

                            <CountryFlagPhoneSubForm
                                onCountryChange={(country) => setValue("country", country, { shouldDirty: true, shouldValidate: true })}
                                onPhoneChange={(phone) => setValue("phoneNumber", phone, { shouldDirty: true, shouldValidate: true })}
                                countryValue={values.country}
                                countryError={errors.country?.message}
                                phoneError={errors.phoneNumber?.message}
                                countryIsValid={!errors.country && !!values.country}
                                phoneIsValid={!errors.phoneNumber && !!values.phoneNumber && values.phoneNumber.replace(/\D/g, "").length >= 9}
                            />
                        </div>
                    )}

                    {/* Step 2: Interests */}
                    {stepIndex === 1 && (
                        <div className="space-y-4">
                            <FormField label="What sports are you interested in?" required error={errors.interests?.message as string | undefined} isValid={Array.isArray(values.interests) && values.interests.length > 0}>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {EQUIPMENT_CATEGORIES.map((cat) => {
                                        const checked = values.interests?.includes(cat);
                                        return (
                                            <label key={cat} className={`cursor-pointer select-none border rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors
                                                ${checked ? "bg-secondary text-secondary-foreground border-secondary" : "bg-background border-input hover:bg-accent"}
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    value={cat}
                                                    className="hidden"
                                                    {...register("interests")} // RHF will collect into string[]
                                                />
                                                <span className="capitalize">{cat}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </FormField>
                        </div>
                    )}

                    {/* Step 3: Links */}
                    {stepIndex === 2 && (
                        <div className="space-y-6">
                            <FormField label="Website URL" error={errors.websiteURL?.message} isValid={!errors.websiteURL && !!values.websiteURL}>
                                <FormInput type="url" placeholder="https://your-website.com" {...register("websiteURL")} />
                            </FormField>
                            <FormField label="Social URL" error={errors.socialURL?.message} isValid={!errors.socialURL && !!values.socialURL}>
                                <FormInput type="url" placeholder="https://instagram.com/your-handle" {...register("socialURL")} />
                            </FormField>
                        </div>
                    )}

                    {/* Step 4: Summary */}
                    {stepIndex === 3 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative p-4 rounded-md border bg-background">
                                    <button type="button" aria-label="Edit first name" onClick={() => editField("firstName")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">First name</div>
                                    <div className="font-medium">{values.firstName || "—"}</div>
                                </div>
                                <div className="relative p-4 rounded-md border bg-background">
                                    <button type="button" aria-label="Edit full name" onClick={() => editField("fullName")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">Full name</div>
                                    <div className="font-medium">{values.fullName || "—"}</div>
                                </div>
                                <div className="relative p-4 rounded-md border bg-background">
                                    <button type="button" aria-label="Edit country" onClick={() => editField("country")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">Country</div>
                                    <div className="font-medium">{values.country || "—"}</div>
                                </div>
                                <div className="relative p-4 rounded-md border bg-background">
                                    <button type="button" aria-label="Edit phone" onClick={() => editField("phoneNumber")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">Phone</div>
                                    <div className="font-medium">{values.phoneNumber || "—"}</div>
                                </div>
                                <div className="relative p-4 rounded-md border bg-background md:col-span-2">
                                    <button type="button" aria-label="Edit interests" onClick={() => editField("interests")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">Interests</div>
                                    <div className="font-medium">{values.interests?.length ? values.interests.join(", ") : "—"}</div>
                                </div>
                                <div className="relative p-4 rounded-md border bg-background">
                                    <button type="button" aria-label="Edit website" onClick={() => editField("websiteURL")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">Website</div>
                                    <div className="font-medium truncate">{values.websiteURL || "—"}</div>
                                </div>
                                <div className="relative p-4 rounded-md border bg-background">
                                    <button type="button" aria-label="Edit social" onClick={() => editField("socialURL")} className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <div className="text-xs text-muted-foreground mb-1">Social</div>
                                    <div className="font-medium truncate">{values.socialURL || "—"}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm">
                                <FormButton type="button" variant="secondary" onClick={() => goTo(0)}>Edit welcome</FormButton>
                                <FormButton type="button" variant="secondary" onClick={() => goTo(1)}>Edit interests</FormButton>
                                <FormButton type="button" variant="secondary" onClick={() => goTo(2)}>Edit links</FormButton>
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
                            <FormButton type="submit" variant="primary">
                                Submit
                            </FormButton>
                        )}
                    </div>
                </Form>
            </div>
        </div>
    );
}
