"use client";

import { FormField, FormInput } from "@/src/components/ui/form";
import { LocationStep } from "./LocationStep";
import { MapPin, Tag, Image as ImageIcon, Mail, CheckCircle2, Globe, Instagram, Pencil } from "lucide-react";
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
    timezone?: string;
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
    {
        id: 1,
        title: "Assets",
        icon: <ImageIcon className="w-4 h-4" />,
        fields: ["iconFile", "bannerFile", "country", "phone", "currency", "latitude", "longitude", "googlePlaceId"],
    },
    {
        id: 2,
        title: "Details",
        icon: <MapPin className="w-4 h-4" />,
        fields: ["websiteUrl", "instagramUrl"],
    },
    { id: 3, title: "Categories", icon: <Tag className="w-4 h-4" />, fields: ["equipmentCategories"] },
    { id: 4, title: "Contact", icon: <Mail className="w-4 h-4" />, fields: ["ownerEmail", "referenceNote"] },
    { id: 5, title: "Summary", icon: <CheckCircle2 className="w-4 h-4" />, fields: [] },
];

interface DetailsStepProps extends BaseStepProps<SchoolFormData> {
    // Props moved to AssetsStep
}

export function DetailsStep({ formMethods }: DetailsStepProps) {
    const {
        register,
        formState: { errors },
    } = formMethods;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Website" error={errors.websiteUrl?.message}>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            <Globe className="w-4 h-4" />
                        </div>
                        <FormInput type="url" placeholder="https://..." {...register("websiteUrl")} className="pl-10" />
                    </div>
                </FormField>

                <FormField label="Instagram" error={errors.instagramUrl?.message}>
                    <div className="flex">
                        <div className="h-10 px-3 bg-muted border border-r-0 border-input flex items-center rounded-l-md text-sm text-muted-foreground whitespace-nowrap">
                            @
                        </div>
                        <FormInput type="text" placeholder="username" {...register("instagramUrl")} className="rounded-l-none" />
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
            <FormField
                label="Equipment Categories"
                required
                error={errors.equipmentCategories?.message as string | undefined}
                isValid={Array.isArray(values.equipmentCategories) && values.equipmentCategories.length > 0}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {EQUIPMENT_CATEGORIES.map((category) => {
                        const checked = values.equipmentCategories?.includes(category.id as "kite" | "wing" | "windsurf");
                        const Icon = category.icon;
                        return (
                            <label
                                key={category.id}
                                style={{
                                    "--category-color": category.color,
                                    "--category-bg-color": category.bgColor,
                                }}
                                className={`
                                    group cursor-pointer select-none border-2 rounded-lg p-4 flex flex-col items-center gap-3 transition-all
                                    ${
                                        checked
                                            ? "bg-card border-[var(--category-color)] text-[var(--category-color)]"
                                            : "bg-card border-border text-foreground"
                                    }
                                `}
                            >
                                <input type="checkbox" value={category.id} className="hidden" {...register("equipmentCategories")} />
                                <div
                                    className={`
                                        p-3 rounded-full transition-colors
                                        ${
                                            checked
                                                ? "bg-[var(--category-bg-color)]"
                                                : "bg-muted group-hover:bg-[var(--category-bg-color)]"
                                        }
                                    `}
                                >
                                    <Icon
                                        className={`
                                            w-8 h-8 transition-colors
                                            ${checked ? "text-white" : "text-[var(--category-color)] group-hover:text-white"}
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

import { useState } from "react";
import { ImageCropper } from "@/src/components/ui/ImageCropper";

interface AssetsStepProps extends BaseStepProps<SchoolFormData> {
    pendingToBucket?: boolean;
    uploadStatus?: string;
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    onLocationChange: (location: { latitude?: number; longitude?: number; googlePlaceId?: string; timezone?: string }) => void;
    triggerPhoneClear: () => void;
}

export function AssetsStep({ 
    formMethods, 
    pendingToBucket, 
    uploadStatus,
    onCountryChange,
    onPhoneChange,
    onLocationChange,
    triggerPhoneClear
}: AssetsStepProps) {
    const { setValue, watch, formState: { errors } } = formMethods;
    const values = watch();
    
    // Cropper State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [activeField, setActiveField] = useState<"iconFile" | "bannerFile" | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "iconFile" | "bannerFile") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setSelectedImageSrc(reader.result?.toString() || null);
                setActiveField(field);
                setCropModalOpen(true);
            });
            reader.readAsDataURL(file);
            // Reset input so the same file can be selected again if cancelled
            e.target.value = ""; 
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        if (activeField && selectedImageSrc) {
            // Create a file from the blob
            const fileName = activeField === "iconFile" ? "icon.jpg" : "banner.jpg";
            const file = new File([croppedBlob], fileName, { type: "image/jpeg" });
            
            setValue(activeField, file, { shouldValidate: true, shouldDirty: true });
            
            // Close modal
            setCropModalOpen(false);
            setSelectedImageSrc(null);
            setActiveField(null);
        }
    };

    const handleCropCancel = () => {
        setCropModalOpen(false);
        setSelectedImageSrc(null);
        setActiveField(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                {/* Left Column: Icon + Location + Currency */}
                <div className="flex-shrink-0 flex flex-col items-center space-y-8 w-full md:w-[320px]">
                    {/* Icon Section */}
                    <div className="flex flex-col items-center space-y-4 w-full">
                        <div className="text-center space-y-1">
                            <label className="text-sm font-bold text-foreground">School Icon</label>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Square (1:1)</p>
                        </div>
                        
                        <label className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group shadow-sm hover:shadow-md">
                             {values.iconFile ? (
                                 <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                                    <div className="text-center text-white">
                                         <Pencil className="w-6 h-6 mx-auto mb-1" />
                                         <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                                    </div>
                                 </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                </div>
                             )}
                             {values.iconFile && (
                                <img 
                                    src={URL.createObjectURL(values.iconFile)} 
                                    className="absolute inset-0 w-full h-full object-cover" 
                                    alt="Preview" 
                                />
                             )}
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={(e) => handleFileSelect(e, "iconFile")}
                                className="hidden"
                                disabled={pendingToBucket}
                            />
                        </label>
                    </div>

                    {/* Location & Currency Section - Moved here */}
                    <div className="w-full space-y-6 bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-sm">
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

                        <div className="flex justify-center w-full pt-2 border-t border-border/50">
                            <FilterDropdown
                                label="Currency"
                                value={values.currency || "EUR"}
                                options={["USD", "EUR", "CHF"]}
                                onChange={(val) => setValue("currency", val as any)}
                                entityColor="#3b82f6"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Banner */}
                <div className="flex-1 flex flex-col space-y-4 w-full">
                    <div className="text-left space-y-1">
                        <label className="text-sm font-bold text-foreground">School Banner</label>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Widescreen (16:9)</p>
                    </div>
                    
                    <label className="relative w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group shadow-sm hover:shadow-md">
                        {values.bannerFile ? (
                             <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                                <div className="text-center text-white">
                                     <Pencil className="w-8 h-8 mx-auto mb-2" />
                                     <span className="text-xs font-bold uppercase tracking-wider">Change Banner</span>
                                </div>
                             </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <ImageIcon className="w-12 h-12 mb-3" />
                                <span className="text-xs font-bold uppercase tracking-wider">Click to upload banner</span>
                                <span className="text-[10px] text-muted-foreground mt-1 opacity-60">High resolution recommended</span>
                            </div>
                        )}
                        {values.bannerFile && (
                            <img 
                                src={URL.createObjectURL(values.bannerFile)} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                alt="Preview" 
                            />
                         )}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={(e) => handleFileSelect(e, "bannerFile")}
                            className="hidden"
                            disabled={pendingToBucket}
                        />
                    </label>
                </div>
            </div>

            {pendingToBucket && (
                <div className="flex items-center justify-center space-x-2 md:space-x-3 text-primary animate-in fade-in duration-300">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs md:text-sm font-medium">{uploadStatus || "Processing..."}</span>
                </div>
            )}
            
            <ImageCropper 
                isOpen={cropModalOpen}
                imageSrc={selectedImageSrc}
                aspect={activeField === "iconFile" ? 1 : 16 / 9}
                cropShape={activeField === "iconFile" ? "round" : "rect"}
                onCancel={handleCropCancel}
                onCropComplete={handleCropComplete}
                title={activeField === "iconFile" ? "Edit Icon" : "Edit Banner"}
            />
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
            displayValue: values.latitude && values.longitude ? `${values.latitude.toFixed(6)}, ${values.longitude.toFixed(6)}` : "—",
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

    return (
        <MultiStepSummary
            formMethods={formMethods}
            fields={summaryFields}
            onEditField={(fieldKey) => onEditField(fieldKey as keyof SchoolFormData, onGoToStep)}
            gridCols={2}
        />
    );
}
