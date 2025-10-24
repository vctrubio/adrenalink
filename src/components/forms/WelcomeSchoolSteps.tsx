"use client";

import { FormField, FormInput } from "@/src/components/ui/form";
import { LocationStep } from "./LocationStep";
import { Building, MapPin, Tag, Image, CheckCircle2 } from "lucide-react";
import type { FormStep, BaseStepProps, SummaryField } from "./multi/types";
import { MultiStepSummary } from "./multi/MultiStepSummary";

const EQUIPMENT_CATEGORIES = ["kite", "wing", "windsurf", "surf", "snowboard"] as const;

// Define the type directly for the multi-step form
export type SchoolFormData = {
    name: string;
    username: string;
    country: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    equipmentCategories: ("kite" | "wing" | "windsurf" | "surf" | "snowboard")[];
    iconFile?: File;
    bannerFile?: File;
    iconUrl?: string;
    bannerUrl?: string;
};

export const WELCOME_SCHOOL_STEPS: FormStep<SchoolFormData>[] = [
    { id: 1, title: "Name", icon: <Building className="w-4 h-4" />, fields: ["name", "username"] },
    { id: 2, title: "Location", icon: <MapPin className="w-4 h-4" />, fields: ["country", "phone", "latitude", "longitude", "googlePlaceId"] },
    { id: 3, title: "Categories", icon: <Tag className="w-4 h-4" />, fields: ["equipmentCategories"] },
    { id: 4, title: "Assets", icon: <Image className="w-4 h-4" />, fields: ["iconFile", "bannerFile"] },
    { id: 5, title: "Summary", icon: <CheckCircle2 className="w-4 h-4" />, fields: [] },
];

interface NameStepProps extends BaseStepProps<SchoolFormData> {
    isGeneratingUsername: boolean;
    usernameStatus: "available" | "unavailable" | "checking" | null;
    onNameBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NameStep({ 
    formMethods,
    isGeneratingUsername, 
    usernameStatus, 
    onNameBlur, 
    onUsernameChange 
}: NameStepProps) {
    const { register, formState: { errors }, watch } = formMethods;
    const values = watch();
    return (
        <div className="space-y-6">
            <FormField 
                label="School Name" 
                required 
                error={errors.name?.message} 
                isValid={!errors.name && !!values.name && values.name.length > 0}
            >
                <FormInput 
                    {...register("name")} 
                    placeholder="Enter school name" 
                    autoFocus 
                    onBlur={onNameBlur} 
                />
            </FormField>

            <FormField 
                label="Username" 
                required 
                error={errors.username?.message} 
                isValid={!errors.username && !!values.username && values.username.length > 0 && usernameStatus === "available"}
            >
                <div className="relative">
                    <FormInput
                        {...register("username", { onChange: onUsernameChange })}
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
    );
}

interface LocationStepWrapperProps extends BaseStepProps<SchoolFormData> {
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    onLocationChange: (location: { latitude?: number; longitude?: number; googlePlaceId?: string }) => void;
    triggerPhoneClear: () => void;
}

export function LocationStepWrapper({ 
    formMethods,
    onCountryChange, 
    onPhoneChange, 
    onLocationChange, 
    triggerPhoneClear 
}: LocationStepWrapperProps) {
    const { formState: { errors }, watch } = formMethods;
    const values = watch();
    return (
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
    );
}

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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {EQUIPMENT_CATEGORIES.map((cat) => {
                        const checked = values.equipmentCategories?.includes(cat);
                        return (
                            <label
                                key={cat}
                                className={`cursor-pointer select-none border rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors
                                ${checked ? "bg-blue-200 text-blue-900 border-blue-300" : "bg-background border-input hover:bg-accent"}
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
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-foreground mb-2">Upload Your School Assets</h3>
                <p className="text-muted-foreground">Add an icon and banner to make your school stand out</p>
            </div>

            {/* Icon Upload */}
            <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-muted rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                        {values.iconFile ? (
                            <img 
                                src={URL.createObjectURL(values.iconFile)} 
                                alt="Icon preview" 
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <Building className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="text-center">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleIconChange}
                                className="hidden"
                                disabled={pendingToBucket}
                            />
                            Choose Icon
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">PNG or JPG, max 2MB, square recommended</p>
                    </div>
                </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full max-w-md h-32 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                        {values.bannerFile ? (
                            <img 
                                src={URL.createObjectURL(values.bannerFile)} 
                                alt="Banner preview" 
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <Image className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="text-center">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleBannerChange}
                                className="hidden"
                                disabled={pendingToBucket}
                            />
                            Choose Banner
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">PNG or JPG, max 5MB, 16:9 ratio recommended</p>
                    </div>
                </div>
            </div>

            {pendingToBucket && (
                <div className="flex items-center justify-center space-x-3 text-primary">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">{uploadStatus || "Processing..."}</span>
                </div>
            )}
        </div>
    );
}

interface SummaryStepProps extends BaseStepProps<SchoolFormData> {
    onEditField: (field: keyof SchoolFormData, goToStep?: (stepIndex: number) => void) => void;
}

export function SummaryStep({ formMethods, onEditField, onGoToStep }: SummaryStepProps) {
    const summaryFields: SummaryField[] = [
        {
            key: "name",
            label: "School Name",
            colSpan: 1
        },
        {
            key: "username", 
            label: "Username",
            colSpan: 1
        },
        {
            key: "country",
            label: "Country", 
            colSpan: 1
        },
        {
            key: "phone",
            label: "Phone",
            colSpan: 1
        },
        {
            key: "equipmentCategories",
            label: "Equipment Categories",
            colSpan: 2
        }
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