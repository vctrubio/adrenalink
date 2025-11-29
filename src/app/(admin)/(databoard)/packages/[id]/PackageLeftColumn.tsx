"use client";

import { useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { updateSchoolPackageDetail } from "@/actions/packages-action";
import type { SchoolPackageModel } from "@/backend/models";
import { formatDate } from "@/getters/date-getter";

function PackageViewMode({ schoolPackage, onEdit }: { schoolPackage: SchoolPackageModel; onEdit: () => void }) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const PackageIcon = packageEntity.icon;

    // Calculate hours from durationMinutes
    const hours = schoolPackage.schema.durationMinutes / 60;
    const pricePerHour = schoolPackage.schema.pricePerStudent / hours;
    const packageName = `${hours}h - $${pricePerHour.toFixed(0)}/h`;

    return (
        <>
            {/* Header */}
            <div>
                <div className="flex items-start gap-6 mb-4">
                    <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
                        <PackageIcon size={48} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground">{schoolPackage.schema.description || "Package"}</h3>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Created {formatDate(schoolPackage.schema.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: packageEntity.color }} />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onEdit}
                    style={{ borderColor: packageEntity.color }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap hover:bg-muted/50 transition-colors"
                >
                    Edit
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Package Style</p>
                    <p className="font-medium text-foreground">{packageName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration (minutes)</p>
                        <p className="font-medium text-foreground">{schoolPackage.schema.durationMinutes}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Price Per Student</p>
                        <p className="font-medium text-foreground">${schoolPackage.schema.pricePerStudent}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Capacity Students</p>
                        <p className="font-medium text-foreground">{schoolPackage.schema.capacityStudents}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Capacity Equipment</p>
                        <p className="font-medium text-foreground">{schoolPackage.schema.capacityEquipment}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Category Equipment</p>
                    <p className="font-medium text-foreground">{schoolPackage.schema.categoryEquipment}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Package Type</p>
                    <p className="font-medium text-foreground">{schoolPackage.schema.packageType}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Public</p>
                        <p className="font-medium text-foreground">{schoolPackage.schema.isPublic ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Active</p>
                        <p className="font-medium text-foreground">{schoolPackage.schema.active ? "Yes" : "No"}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-medium text-foreground">{formatDate(schoolPackage.schema.updatedAt)}</p>
                </div>
            </div>
        </>
    );
}

function PackageEditMode({ schoolPackage, onCancel, onSubmit }: { schoolPackage: SchoolPackageModel; onCancel: () => void; onSubmit: (data: any) => Promise<void> }) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const PackageIcon = packageEntity.icon;

    const initialFormData = {
        description: schoolPackage.updateForm.description,
        durationMinutes: schoolPackage.updateForm.durationMinutes,
        pricePerStudent: schoolPackage.updateForm.pricePerStudent,
        capacityStudents: schoolPackage.updateForm.capacityStudents,
        capacityEquipment: schoolPackage.updateForm.capacityEquipment,
        categoryEquipment: schoolPackage.updateForm.categoryEquipment,
        packageType: schoolPackage.updateForm.packageType,
        isPublic: Boolean(schoolPackage.updateForm.isPublic),
        active: Boolean(schoolPackage.updateForm.active),
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
            {/* Header */}
            <div>
                <div className="flex items-start gap-6 mb-4">
                    <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
                        <PackageIcon size={48} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground">{schoolPackage.schema.description || "Package"}</h3>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Created {formatDate(schoolPackage.schema.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: packageEntity.color }} />
            </div>

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
                    style={{ borderColor: packageEntity.color }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${packageEntity.color}15`;
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
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Package description"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
                        <input
                            type="number"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="120"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Price Per Student</label>
                        <input
                            type="number"
                            value={formData.pricePerStudent}
                            onChange={(e) => setFormData({ ...formData, pricePerStudent: parseInt(e.target.value) || 0 })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="60"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Capacity Students</label>
                        <input
                            type="number"
                            value={formData.capacityStudents}
                            onChange={(e) => setFormData({ ...formData, capacityStudents: parseInt(e.target.value) || 0 })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="10"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Capacity Equipment</label>
                        <input
                            type="number"
                            value={formData.capacityEquipment}
                            onChange={(e) => setFormData({ ...formData, capacityEquipment: parseInt(e.target.value) || 0 })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="5"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Category Equipment</label>
                    <input
                        type="text"
                        value={formData.categoryEquipment}
                        onChange={(e) => setFormData({ ...formData, categoryEquipment: e.target.value })}
                        className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Equipment category"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Package Type</label>
                    <input
                        type="text"
                        value={formData.packageType}
                        onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                        className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Package type"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            className="size-4 rounded border border-input bg-background cursor-pointer accent-primary"
                        />
                        <label className="text-sm font-medium text-foreground cursor-pointer">Public</label>
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
            </div>
        </>
    );
}

export function PackageLeftColumn({ schoolPackage, className }: { schoolPackage: SchoolPackageModel, className?: string }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (formData: any) => {
        const result = await updateSchoolPackageDetail({ ...schoolPackage.updateForm, ...formData });
        if (result.success) {
            setIsEditing(false);
        } else {
            console.error("Error updating package:", result.error);
        }
    };

    const content = isEditing ? (
        <PackageEditMode schoolPackage={schoolPackage} onCancel={() => setIsEditing(false)} onSubmit={handleSubmit} />
    ) : (
        <PackageViewMode schoolPackage={schoolPackage} onEdit={() => setIsEditing(true)} />
    );

    return <div className={`space-y-4 ${className || ""}`.trim()}>{content}</div>;
}
