"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";
import { ENTITY_DATA } from "@/config/entities";
import { UrlParamAddTag } from "@/src/components/tags";
import { updateTeacherDetail } from "@/actions/teachers-action";
import { CountryFlagPhoneSubForm } from "@/src/components/forms/CountryFlagPhoneSubForm";
import { getCountryByName } from "@/config/countries";
import type { TeacherModel } from "@/backend/models";
import { ChevronDown } from "lucide-react";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/src/components/ui/form"; // Correct import for Form

const teacherFormSchema = z.object({
    username: z.string().min(1, "Username is required.").max(50, "Username must be at most 50 characters.").regex(/^\S+$/, "Username cannot contain spaces."),
    firstName: z.string().min(1, "First name is required.").max(255, "First name must be at most 255 characters."),
    lastName: z.string().min(1, "Last name is required.").max(255, "Last name must be at most 255 characters."),
    passport: z.string().min(1, "Passport is required.").max(50, "Passport must be at most 50 characters."),
    country: z.string().min(1, "Country is required.").max(100, "Country must be at most 100 characters."),
    phone: z.string().min(1, "Phone is required.").max(20, "Phone must be at most 20 characters."),
    languages: z
        .string()
        .min(1, "At least one language is required.")
        .transform((val) =>
            val
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean),
        ), // Handle comma-separated languages
    active: z.boolean(),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

function TeacherViewMode({ teacher, onEdit }: { teacher: TeacherModel; onEdit: () => void }) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            {/* Buttons */}
            <div className="flex items-center gap-2">
                <UrlParamAddTag type="teacher" id={teacher.schema.id} color={teacherEntity.color} />
                <Link href={`/teacher/${teacher.schema.id}`} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors text-sm font-medium whitespace-nowrap">
                    View Profile
                </Link>
                <button onClick={onEdit} style={{ borderColor: teacherEntity.color }} className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap hover:bg-muted/50 transition-colors">
                    Edit
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ borderColor: teacherEntity.color }} className="px-2 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <ChevronDown size={16} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">Toggle Status</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Username</p>
                    <p className="font-medium text-foreground">{teacher.updateForm.username}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Passport</p>
                    <p className="font-medium text-foreground">{teacher.updateForm.passport}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Country</p>
                        <div className="flex items-center gap-2">
                            {teacher.updateForm.country &&
                                (() => {
                                    const country = getCountryByName(teacher.updateForm.country);
                                    return country ? (
                                        <>
                                            <ReactCountryFlag
                                                countryCode={country.code}
                                                svg
                                                style={{
                                                    width: "1.2em",
                                                    height: "1.2em",
                                                }}
                                            />
                                            <p className="font-medium text-foreground">{teacher.updateForm.country}</p>
                                        </>
                                    ) : (
                                        <p className="font-medium text-foreground">{teacher.updateForm.country}</p>
                                    );
                                })()}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Phone</p>
                        <p className="font-medium text-foreground font-mono">{teacher.updateForm.phone}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Languages</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.updateForm.languages.map((lang) => (
                            <span key={lang} className="inline-block px-2 py-1 rounded text-xs font-medium border border-border text-foreground">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="font-medium text-foreground">{teacher.updateForm.active ? "Yes" : "No"}</p>
                </div>
            </div>
        </>
    );
}

function TeacherEditMode({ teacher, onCancel, onSubmit }: { teacher: TeacherModel; onCancel: () => void; onSubmit: (data: TeacherFormValues) => Promise<void> }) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    const methods = useForm<TeacherFormValues>({
        resolver: zodResolver(teacherFormSchema),
        defaultValues: {
            username: teacher.updateForm.username,
            firstName: teacher.updateForm.firstName,
            lastName: teacher.updateForm.lastName,
            passport: teacher.updateForm.passport,
            country: teacher.updateForm.country,
            phone: teacher.updateForm.phone,
            languages: teacher.updateForm.languages.join(", "),
            active: Boolean(teacher.updateForm.active),
        },
    });

    const {
        handleSubmit,
        reset,
        register,
        watch,
        formState: { isSubmitting, isDirty, errors },
    } = methods;

    const handleFormSubmit = async (data: TeacherFormValues) => {
        await onSubmit(data);
    };

    const handleReset = () => {
        reset(); // Resets form to defaultValues
    };

    const watchedLanguages = watch("languages");

    return (
        <>
            {/* Buttons */}
            <div className="flex items-center gap-2">
                <Link href={`/teacher/${teacher.schema.id}`} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors text-sm font-medium whitespace-nowrap">
                    View Profile
                </Link>
                <button onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap">
                    Cancel
                </button>
                <button onClick={handleReset} disabled={!isDirty || isSubmitting} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap">
                    Reset
                </button>
                <button
                    onClick={handleSubmit(handleFormSubmit)}
                    disabled={!isDirty || isSubmitting}
                    style={{ borderColor: teacherEntity.color }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${teacherEntity.color}15`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Form */}
            <Form methods={methods} onSubmit={handleFormSubmit}>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Username</label>
                    <input
                        type="text"
                        {...register("username")}
                        className={`w-full h-10 mt-1 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.username ? "border-destructive" : "border-input"}`}
                        placeholder="Username"
                    />
                    {errors.username && <p className="text-destructive text-xs mt-1">{errors.username.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">First Name</label>
                        <input
                            type="text"
                            {...register("firstName")}
                            className={`w-full h-10 mt-1 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.firstName ? "border-destructive" : "border-input"}`}
                            placeholder="First name"
                        />
                        {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                        <input
                            type="text"
                            {...register("lastName")}
                            className={`w-full h-10 mt-1 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.lastName ? "border-destructive" : "border-input"}`}
                            placeholder="Last name"
                        />
                        {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                <CountryFlagPhoneSubForm
                    countryValue={watch("country")}
                    initialPhone={watch("phone")}
                    onCountryChange={(country) => methods.setValue("country", country, { shouldValidate: true, shouldDirty: true })}
                    onPhoneChange={(phone) => methods.setValue("phone", phone, { shouldValidate: true, shouldDirty: true })}
                />
                {errors.country && <p className="text-destructive text-xs mt-1">{errors.country.message}</p>}
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Passport</label>
                    <input
                        type="text"
                        {...register("passport")}
                        className={`w-full h-10 mt-1 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.passport ? "border-destructive" : "border-input"}`}
                        placeholder="Passport number"
                    />
                    {errors.passport && <p className="text-destructive text-xs mt-1">{errors.passport.message}</p>}
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Languages</label>
                    <input
                        type="text"
                        {...register("languages")}
                        className={`w-full h-10 mt-1 px-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.languages ? "border-destructive" : "border-input"}`}
                        placeholder="Languages separated by commas"
                    />
                    {errors.languages && <p className="text-destructive text-xs mt-1">{errors.languages.message}</p>}
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" {...register("active")} className="size-4 rounded border border-input bg-background cursor-pointer accent-primary" />
                    <label className="text-sm font-medium text-foreground cursor-pointer">Active</label>
                </div>
            </Form>
        </>
    );
}

export function TeacherLeftColumn({ teacher, className }: { teacher: TeacherModel; className?: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: any) => {
        const oldUsername = teacher.updateForm.username;
        const result = await updateTeacherDetail({ ...teacher.updateForm, ...formData });

        if (result.success) {
            setIsEditing(false);
            const newUsername = formData.username;

            if (newUsername && newUsername !== oldUsername) {
                router.push(`/teachers/${newUsername}`);
            } else {
                router.refresh();
            }
        } else {
            console.error("Error updating teacher:", result.error);
        }
    };

    const content = isEditing ? <TeacherEditMode teacher={teacher} onCancel={() => setIsEditing(false)} onSubmit={handleSubmit} /> : <TeacherViewMode teacher={teacher} onEdit={() => setIsEditing(true)} />;

    return <div className={`space-y-4 ${className || ""}`.trim()}>{content}</div>;
}
