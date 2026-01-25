"use client";

import { useState, useRef, useCallback } from "react";
import { FormField, FormInput } from "@/src/components/ui/form";
import { MapPin, Tag, Image as ImageIcon, Mail, CheckCircle2, Globe, Search, Clock, Check, Pencil, User, ArrowRight } from "lucide-react";
import type { FormStep, BaseStepProps, SummaryField } from "./multi/types";
import { MultiStepSummary } from "./multi/MultiStepSummary";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ImageCropper } from "@/src/components/ui/ImageCropper";
import { getPhoneCodeByCountryCode, COUNTRIES } from "@/config/countries";
import { UserAuth } from "@/types/user";
import { SignInButton } from "@clerk/nextjs";

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
    clerkId?: string;
}

export const WELCOME_SCHOOL_STEPS: FormStep<SchoolFormData>[] = [
    {
        id: 1,
        title: "Assets",
        icon: <ImageIcon className="w-4 h-4" />,
        fields: ["iconFile", "bannerFile"],
    },
    {
        id: 2,
        title: "Social",
        icon: <MapPin className="w-4 h-4" />,
        fields: ["country", "phone", "websiteUrl", "instagramUrl", "latitude", "longitude", "googlePlaceId"],
    },
    {
        id: 3,
        title: "Identification",
        icon: <User className="w-4 h-4" />,
        fields: ["ownerEmail", "referenceNote"],
    },
    { id: 4, title: "Categories", icon: <Tag className="w-4 h-4" />, fields: ["equipmentCategories"] },
    { id: 5, title: "Summary", icon: <CheckCircle2 className="w-4 h-4" />, fields: [] },
];

// --- STEP 1: ASSETS (Icon & Banner) ---

interface AssetsStepProps extends BaseStepProps<SchoolFormData> {
    pendingToBucket?: boolean;
    uploadStatus?: string;
}

export function AssetsStep({ formMethods, pendingToBucket, uploadStatus }: AssetsStepProps) {
    const { setValue, watch } = formMethods;
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
            e.target.value = ""; 
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        if (activeField && selectedImageSrc) {
            const fileName = activeField === "iconFile" ? "icon.jpg" : "banner.jpg";
            const file = new File([croppedBlob], fileName, { type: "image/jpeg" });
            setValue(activeField, file, { shouldValidate: true, shouldDirty: true });
            setCropModalOpen(false);
            setSelectedImageSrc(null);
            setActiveField(null);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                {/* Left Column: Icon */}
                <div className="flex-shrink-0 flex flex-col items-center space-y-4 w-full md:w-[340px]">
                    <div className="text-center space-y-1">
                        <label className="text-sm font-bold text-foreground">School Icon</label>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Square (1:1)</p>
                    </div>
                    
                    <label className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group shadow-sm">
                            {values.iconFile ? (
                            <img src={URL.createObjectURL(values.iconFile)} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                            ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                            </div>
                            )}
                            <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                            <Pencil className="w-6 h-6 text-white" />
                            </div>
                        <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "iconFile")} className="hidden" />
                    </label>
                </div>

                {/* Right Column: Banner */}
                <div className="flex-1 flex flex-col space-y-4 w-full">
                    <div className="text-left space-y-1">
                        <label className="text-sm font-bold text-foreground">School Banner</label>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Widescreen (16:9)</p>
                    </div>
                    
                    <label className="relative w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group shadow-sm">
                        {values.bannerFile ? (
                                <img src={URL.createObjectURL(values.bannerFile)} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                            ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <ImageIcon className="w-12 h-12 mb-3" />
                                <span className="text-xs font-bold uppercase tracking-wider">Click to upload banner</span>
                                <span className="text-[10px] opacity-60">High resolution recommended</span>
                            </div>
                        )}
                        <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                            <Pencil className="w-8 h-8 text-white" />
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "bannerFile")} className="hidden" />
                    </label>
                </div>
            </div>

            {pendingToBucket && (
                <div className="flex items-center justify-center space-x-3 text-primary animate-pulse">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">{uploadStatus || "Uploading Assets..."}</span>
                </div>
            )}
            
            <ImageCropper 
                isOpen={cropModalOpen}
                imageSrc={selectedImageSrc}
                aspect={activeField === "iconFile" ? 1 : 16 / 9}
                cropShape={activeField === "iconFile" ? "round" : "rect"}
                onCancel={() => setCropModalOpen(false)}
                onCropComplete={handleCropComplete}
                title={activeField === "iconFile" ? "Edit Icon" : "Edit Banner"}
            />
        </div>
    );
}

// --- STEP 2: SOCIAL (Location, Phone, Socials) ---

interface SocialStepProps extends BaseStepProps<SchoolFormData> {
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    onLocationChange: (location: { latitude?: number; longitude?: number; googlePlaceId?: string; timezone?: string }) => void;
}

export function SocialStep({ formMethods, onCountryChange, onPhoneChange, onLocationChange }: SocialStepProps) {
    const { register, formState: { errors }, watch, setValue } = formMethods;
    const values = watch();

    // Google Places Search State
    const [searchValue, setSearchValue] = useState("");
    const [googlePlaces, setGooglePlaces] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const searchPlaces = useCallback(async (query: string) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (query.length < 3) {
            setGooglePlaces([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.status === "OK") setGooglePlaces(data.predictions.slice(0, 5));
            } catch (error) {
                console.error("Error searching places:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }, []);

    const selectPlace = async (place: any) => {
        try {
            const response = await fetch(`/api/places/details?place_id=${place.place_id}`);
            const data = await response.json();

            if (data.status === "OK" && data.result) {
                const { geometry, address_components } = data.result;
                const lat = geometry?.location?.lat;
                const lng = geometry?.location?.lng;

                // Find country code
                const countryComponent = address_components?.find((c: any) => c.types.includes("country"));
                const countryCode = countryComponent?.short_name;

                // Fetch Timezone
                let tz = "";
                if (lat && lng) {
                    const tzRes = await fetch(`/api/places/timezone?lat=${lat}&lng=${lng}`);
                    const tzData = await tzRes.json();
                    tz = tzData.timeZoneId || Intl.DateTimeFormat().resolvedOptions().timeZone;
                }

                onLocationChange({
                    googlePlaceId: place.place_id,
                    latitude: lat,
                    longitude: lng,
                    timezone: tz,
                });

                if (countryCode) {
                    onCountryChange(countryCode);
                }

                setSearchValue(data.result.formatted_address);
                setGooglePlaces([]);
            }
        } catch (error) {
            console.error("Error selecting place:", error);
        }
    };

    const selectedCountry = COUNTRIES.find(c => c.code === values.country);
    const phonePrefix = selectedCountry?.phoneCode || "+";

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Location & Phone */}
                <div className="space-y-6">
                    {/* Search Location */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-bold text-foreground">Location</label>
                            {values.googlePlaceId && <Check className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormInput 
                                className="pl-10" 
                                placeholder="Search school address..." 
                                value={searchValue} 
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    searchPlaces(e.target.value);
                                }}
                            />
                            {googlePlaces.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                                    {googlePlaces.map((p) => (
                                        <button key={p.place_id} onClick={() => selectPlace(p)} className="w-full text-left px-4 py-3 hover:bg-accent text-sm border-b border-border/50 last:border-0">
                                            {p.description}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Country & Timezone Display */}
                        {values.country && (
                            <div className="flex gap-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                                    <Globe className="w-3 h-3" />
                                    {selectedCountry?.name || values.country}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md truncate max-w-[200px]">
                                    <Clock className="w-3 h-3" />
                                    {values.timezone?.split('/').pop()?.replace('_', ' ') || "UTC"}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Phone (WhatsApp)</label>
                        <div className="flex gap-0">
                            <div className="h-10 px-3 bg-muted border border-r-0 border-input flex items-center rounded-l-md text-sm font-bold text-muted-foreground min-w-[60px]">
                                {phonePrefix}
                            </div>
                            <FormInput 
                                className="rounded-l-none" 
                                placeholder="Number" 
                                {...register("phone")}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Socials */}
                <div className="space-y-6">
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
        </div>
    );
}

// --- STEP 3: IDENTIFICATION (Sign In & User Info) ---

interface IdentificationStepProps extends BaseStepProps<SchoolFormData> {
    user?: UserAuth | null;
}

export function IdentificationStep({ formMethods, user }: IdentificationStepProps) {
    const { register, formState: { errors } } = formMethods;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-muted/20 border border-border rounded-xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-lg text-foreground">School Owner</h3>
                    <p className="text-sm text-muted-foreground">You are currently signed in as:</p>
                    <div className="pt-2 flex flex-col gap-1">
                        <span className="font-medium text-foreground">{user?.firstName} {user?.lastName}</span>
                        <span className="text-sm text-muted-foreground font-mono">{user?.email}</span>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border border-green-200 dark:border-green-800">
                    Verified
                </div>
            </div>

            <FormField label="Contact Email" error={errors.ownerEmail?.message} isValid={true}>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                    </div>
                    <FormInput 
                        type="email" 
                        {...register("ownerEmail")} 
                        className="pl-10 bg-muted cursor-not-allowed opacity-80"
                        readOnly
                    />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                    This email is linked to your identity and cannot be changed here.
                </p>
            </FormField>

            <FormField label="How did you hear about us?" error={errors.referenceNote?.message}>
                <FormInput 
                    type="text" 
                    placeholder="Social media, Google, friend, etc..." 
                    {...register("referenceNote")} 
                />
            </FormField>
        </div>
    );
}

// --- STEP 4: CATEGORIES ---

export function CategoriesStep({ formMethods }: BaseStepProps<SchoolFormData>) {
    const { register, formState: { errors }, watch } = formMethods;
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

// --- STEP 5: SUMMARY ---

interface SummaryStepProps extends BaseStepProps<SchoolFormData> {
    onEditField: (field: keyof SchoolFormData, goToStep?: (stepIndex: number) => void) => void;
}

export function SummaryStep({ formMethods, onEditField, onGoToStep }: SummaryStepProps) {
    const { watch } = formMethods;
    const values = watch();

    const summaryFields: SummaryField[] = [
        { key: "name", label: "School Name", colSpan: 1 },
        { key: "currency", label: "Currency", colSpan: 1 },
        { key: "username", label: "Username", colSpan: 1 },
        { key: "country", label: "Country", colSpan: 1 },
        { key: "phone", label: "Phone (WhatsApp)", colSpan: 1 },
        { key: "websiteUrl", label: "Website", colSpan: 1, displayValue: values.websiteUrl || "—" },
        { key: "instagramUrl", label: "Instagram", colSpan: 1, displayValue: values.instagramUrl || "—" },
        { key: "equipmentCategories", label: "Equipment Categories", colSpan: 2 },
        { key: "latitude", label: "Geolocation", colSpan: 2, displayValue: values.latitude && values.longitude ? `${values.latitude.toFixed(6)}, ${values.longitude.toFixed(6)}` : "—" },
        { key: "iconFile", label: "School Icon", colSpan: 1, displayValue: values.iconFile ? "📷 Icon uploaded" : "—" },
        { key: "bannerFile", label: "School Banner", colSpan: 1, displayValue: values.bannerFile ? "🖼️ Banner uploaded" : "—" },
        { key: "ownerEmail", label: "Contact Email", colSpan: 1 },
        { key: "referenceNote", label: "How you heard about us", colSpan: 1 },
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
