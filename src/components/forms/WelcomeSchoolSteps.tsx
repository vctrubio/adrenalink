"use client";

import { FormField, FormInput } from "@/src/components/ui/form";
import { LocationStep } from "./LocationStep";
import { MapPin, Tag, Image as ImageIcon, Mail, CheckCircle2, Globe, Instagram, MessageCircle } from "lucide-react";
import type { FormStep, BaseStepProps, SummaryField } from "./multi/types";
import { MultiStepSummary } from "./multi/MultiStepSummary";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";

// Define the type directly for the multi-step form
export interface SchoolFormData {
    name: string;
    username: string;
    country: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    equipmentCategories: ("kite" | "wing" | "windsurf")[];
    iconFile?: File;
    bannerFile?: File;
    iconUrl?: string;
    bannerUrl?: string;
    ownerEmail: string;
    referenceNote: string;
    websiteUrl?: string;
    instagramUrl?: string;
    currency: "USD" | "EUR" | "CHF";
    ownerId: string;
}

export const WELCOME_SCHOOL_STEPS: FormStep<SchoolFormData>[] = [
    { id: 1, title: "Assets", icon: <ImageIcon className="w-4 h-4" />, fields: ["iconFile", "bannerFile"] },
    { id: 2, title: "Details", icon: <MapPin className="w-4 h-4" />, fields: ["country", "phone", "currency", "latitude", "longitude", "googlePlaceId", "websiteUrl", "instagramUrl"] },
    { id: 3, title: "Categories", icon: <Tag className="w-4 h-4" />, fields: ["equipmentCategories"] },
    { id: 4, title: "Contact", icon: <Mail className="w-4 h-4" />, fields: ["ownerEmail", "referenceNote"] },
    { id: 5, title: "Summary", icon: <CheckCircle2 className="w-4 h-4" />, fields: [] },
];

interface DetailsStepProps extends BaseStepProps<SchoolFormData> {
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    onLocationChange: (location: { latitude?: number; longitude?: number; googlePlaceId?: string }) => void;
    triggerPhoneClear: () => void;
}

export function DetailsStep({ formMethods, onCountryChange, onPhoneChange, onLocationChange, triggerPhoneClear }: DetailsStepProps) {
    const {
        register,
        formState: { errors },
        watch,
        setValue,
    } = formMethods;
    const values = watch();

    return (
        <div className="space-y-6">
            <LocationStep
                country={values.country}
                phone={values.phone}
                latitude={values.latitude}
                longitude={values.longitude}
                googlePlaceId={values.googlePlaceId}
                countryError={errors.country?.message}
                phoneError={errors.phone?.message}
                onCountryChange={onCountryChange}
                onPhoneChange={onPhoneChange}
                onLocationChange={onLocationChange}
                triggerPhoneClear={triggerPhoneClear}
            />
            
            <div className="flex justify-end">
                 <FilterDropdown
                    label="Currency"
                    value={values.currency || "EUR"}
                    options={["USD", "EUR", "CHF"]}
                    onChange={(val) => setValue("currency", val as any)}
                    entityColor="#3b82f6" // Secondary color blue-500
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Website" error={errors.websiteUrl?.message}>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            <Globe className="w-4 h-4" />
                        </div>
                        <FormInput 
                            type="url" 
                            placeholder="https://..." 
                            {...register("websiteUrl")} 
                            className="pl-10"
                        />
                    </div>
                </FormField>

                <FormField label="Instagram" error={errors.instagramUrl?.message}>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            <Instagram className="w-4 h-4" />
                        </div>
                        <FormInput 
                            type="url" 
                            placeholder="https://instagram.com/..." 
                            {...register("instagramUrl")} 
                            className="pl-10"
                        />
                    </div>
                </FormField>
            </div>
        </div>
    );
}

export function CategoriesStep({ formMethods }: BaseStepProps<SchoolFormData>) {
    const {
        register,
        formState: { errors },
        watch,
    } = formMethods;
    const values = watch();
    return (
        <div className="space-y-4">
            <FormField label="Equipment Categories" required error={errors.equipmentCategories?.message as string | undefined} isValid={Array.isArray(values.equipmentCategories) && values.equipmentCategories.length > 0}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {EQUIPMENT_CATEGORIES.map((category) => {
                        const checked = values.equipmentCategories?.includes(category.id as "kite" | "wing" | "windsurf");
                        const Icon = category.icon;
                        return (
                            <label
                                key={category.id}
                                style={{
                                    "--category-color": category.color,
                                    "--category-bg-color": category.bgColor
                                }}
                                className={`
                                    group cursor-pointer select-none border-2 rounded-lg p-4 flex flex-col items-center gap-3 transition-all
                                    ${checked
                                        ? "bg-card border-[var(--category-color)] text-[var(--category-color)]"
                                        : "bg-card border-border text-foreground"
                                    }
                                `}
                            >
                                <input type="checkbox" value={category.id} className="hidden" {...register("equipmentCategories")} />
                                <div
                                    className={`
                                        p-3 rounded-full transition-colors
                                        ${checked
                                            ? "bg-[var(--category-bg-color)]"
                                            : "bg-muted group-hover:bg-[var(--category-bg-color)]"
                                        }
                                    `}
                                >
                                    <Icon
                                        className={`
                                            w-8 h-8 transition-colors
                                            ${checked
                                                ? "text-white"
                                                : "text-[var(--category-color)] group-hover:text-white"
                                            }
                                        `}
                                        size={32}
                                        center={true}
                                    />
                                </div>
                                <span className="font-semibold">{category.name}</span>
                            </label>
                        );
                    })}
                </div>
            </FormField>
        </div>
    );
}

interface AssetsStepProps extends BaseStepProps<SchoolFormData> {
    pendingToBucket?: boolean;
    uploadStatus?: string;
}

export function AssetsStep({ formMethods, pendingToBucket, uploadStatus }: AssetsStepProps) {
    const { setValue, watch } = formMethods;
    const values = watch();

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("iconFile", file);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("bannerFile", file);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Icon Upload */}
                <div className="space-y-3">
                    <div className="text-center md:text-left">
                        <label className="text-sm font-medium text-foreground">School Icon</label>
                        <p className="text-xs text-muted-foreground mb-3">Square recommended, max 2MB</p>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> icon</p>
                        </div>
                        <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleIconChange} className="hidden" disabled={pendingToBucket} />
                    </label>
                    {values.iconFile && <p className="text-xs text-green-500 text-center md:text-left">✓ Icon selected</p>}
                </div>

                {/* Banner Upload */}
                <div className="space-y-3">
                    <div className="text-center md:text-left">
                        <label className="text-sm font-medium text-foreground">School Banner</label>
                        <p className="text-xs text-muted-foreground mb-3">16:9 recommended, max 5MB</p>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> banner</p>
                        </div>
                        <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleBannerChange} className="hidden" disabled={pendingToBucket} />
                    </label>
                    {values.bannerFile && <p className="text-xs text-green-500 text-center md:text-left">✓ Banner selected</p>}
                </div>
            </div>

            {pendingToBucket && (
                <div className="flex items-center justify-center space-x-2 md:space-x-3 text-primary animate-in fade-in duration-300">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs md:text-sm font-medium">{uploadStatus || "Processing..."}</span>
                </div>
            )}
        </div>
    );
}

export function ContactStep({ formMethods }: BaseStepProps<SchoolFormData>) {
    const {
        register,
        formState: { errors },
    } = formMethods;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="text-center space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-semibold">Contact</h3>
                <p className="text-sm md:text-base text-muted-foreground">How can we reach you and learn more about your journey?</p>
            </div>

            <div className="space-y-3 md:space-y-4">
                <FormField label="Contact Email" error={errors.ownerEmail?.message}>
                    <FormInput type="email" placeholder="your@email.com" {...register("ownerEmail")} />
                </FormField>

                <FormField label="How did you hear about us?" error={errors.referenceNote?.message}>
                    <FormInput type="text" placeholder="Social media, Google, friend, etc..." {...register("referenceNote")} />
                </FormField>
            </div>
        </div>
    );
}

interface SummaryStepProps extends BaseStepProps<SchoolFormData> {
    onEditField: (field: keyof SchoolFormData, goToStep?: (stepIndex: number) => void) => void;
}

export function SummaryStep({ formMethods, onEditField, onGoToStep }: SummaryStepProps) {
    const { watch } = formMethods;
    const values = watch();

    const summaryFields: SummaryField[] = [
        {
            key: "name",
            label: "School Name",
            colSpan: 1,
        },
        {
            key: "currency",
            label: "Currency",
            colSpan: 1,
        },
        {
            key: "username",
            label: "Username",
            colSpan: 1,
        },
        {
            key: "country",
            label: "Country",
            colSpan: 1,
        },
        {
            key: "phone",
            label: "Phone (WhatsApp)",
            colSpan: 1,
        },
        {
            key: "websiteUrl",
            label: "Website",
            colSpan: 1,
            displayValue: values.websiteUrl || "—",
        },
        {
            key: "instagramUrl",
            label: "Instagram",
            colSpan: 1,
            displayValue: values.instagramUrl || "—",
        },
        {
            key: "equipmentCategories",
            label: "Equipment Categories",
            colSpan: 2,
        },
        {
            key: "latitude",
            label: "Geolocation",
            colSpan: 2,
            displayValue: values.latitude && values.longitude 
                ? `${values.latitude.toFixed(6)}, ${values.longitude.toFixed(6)}`
                : "—",
        },
        {
            key: "iconFile",
            label: "School Icon",
            colSpan: 1,
            displayValue: values.iconFile ? "📷 Icon uploaded" : "—",
        },
        {
            key: "bannerFile",
            label: "School Banner",
            colSpan: 1,
            displayValue: values.bannerFile ? "🖼️ Banner uploaded" : "—",
        },
        {
            key: "ownerEmail",
            label: "Contact Email",
            colSpan: 1,
        },
        {
            key: "referenceNote",
            label: "How you heard about us",
            colSpan: 1,
        },
    ];

    return <MultiStepSummary formMethods={formMethods} fields={summaryFields} onEditField={(fieldKey) => onEditField(fieldKey as keyof SchoolFormData, onGoToStep)} gridCols={2} />;
}