"use client";

import { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { ENTITY_DATA } from "@/config/entities";
import { updateTeacherDetail } from "@/actions/teachers-action";
import { CountryFlagPhoneSubForm } from "@/src/components/forms/CountryFlagPhoneSubForm";
import { getCountryByName } from "@/config/countries";
import type { TeacherModel } from "@/backend/models";
import { ChevronDown } from "lucide-react";

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
                <button
                    onClick={onEdit}
                    style={{ borderColor: teacherEntity.color }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap hover:bg-muted/50 transition-colors"
                >
                    Edit
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ borderColor: teacherEntity.color }}
                        className="px-2 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                        <ChevronDown size={16} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                                Toggle Status
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Country</p>
                        <div className="flex items-center gap-2">
                            {teacher.updateForm.country && (() => {
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
                    <p className="text-xs text-muted-foreground mb-1">Passport</p>
                    <p className="font-medium text-foreground">{teacher.updateForm.passport}</p>
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

function TeacherEditMode({ teacher, onCancel, onSubmit }: { teacher: TeacherModel; onCancel: () => void; onSubmit: (data: any) => Promise<void> }) {
    const initialFormData = {
        firstName: teacher.updateForm.firstName,
        lastName: teacher.updateForm.lastName,
        passport: teacher.updateForm.passport,
        country: teacher.updateForm.country,
        phone: teacher.updateForm.phone,
        languages: teacher.updateForm.languages,
        active: Boolean(teacher.updateForm.active),
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

    const handleReset = () => {
        setFormData(initialFormData);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                >
                    Cancel
                </button>
                <button
                    onClick={handleReset}
                    disabled={!hasChanges || isSubmitting}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                >
                    Reset
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!hasChanges || isSubmitting}
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
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="First name"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Last name"
                        />
                    </div>
                </div>

                <CountryFlagPhoneSubForm
                    countryValue={formData.country}
                    initialPhone={formData.phone}
                    onCountryChange={(country) => setFormData({ ...formData, country })}
                    onPhoneChange={(phone) => setFormData({ ...formData, phone })}
                />

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Passport</label>
                    <input
                        type="text"
                        value={formData.passport}
                        onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                        className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Passport number"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Languages</label>
                    <input
                        type="text"
                        value={formData.languages.join(", ")}
                        onChange={(e) => setFormData({ ...formData, languages: e.target.value.split(",").map((l) => l.trim()) })}
                        className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Languages separated by commas"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="size-4 rounded border border-input bg-background cursor-pointer accent-primary"
                    />
                    <label className="text-sm font-medium text-foreground cursor-pointer">Active</label>
                </div>
            </div>
        </>
    );
}

export function TeacherLeftColumn({ teacher, className }: { teacher: TeacherModel, className?: string }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (formData: any) => {
        const result = await updateTeacherDetail({ ...teacher.updateForm, ...formData });
        if (result.success) {
            setIsEditing(false);
        } else {
            console.error("Error updating teacher:", result.error);
        }
    };

    const content = isEditing ? (
        <TeacherEditMode teacher={teacher} onCancel={() => setIsEditing(false)} onSubmit={handleSubmit} />
    ) : (
        <TeacherViewMode teacher={teacher} onEdit={() => setIsEditing(true)} />
    );

    return <div className={`space-y-4 ${className || ""}`.trim()}>{content}</div>;
}
