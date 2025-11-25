"use client";

import { useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { updateEquipment } from "@/actions/equipments-action";
import { formatDate } from "@/getters/date-getter";
import type { EquipmentModel } from "@/backend/models";

function EquipmentViewMode({ equipment, onEdit }: { equipment: EquipmentModel; onEdit: () => void }) {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const categoryColor = categoryConfig?.color || equipmentEntity.color;

    const equipmentName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

    return (
        <>
            {/* Header */}
            <div>
                <div className="flex items-start gap-6 mb-4">
                    <div className="flex-shrink-0" style={{ color: categoryColor }}>
                        {categoryConfig?.icon ? <categoryConfig.icon size={48} /> : <equipmentEntity.icon size={48} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground">{equipmentName}</h3>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Created {formatDate(equipment.schema.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: categoryColor }} />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onEdit}
                    style={{ borderColor: categoryColor }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap hover:bg-muted/50 transition-colors"
                >
                    Edit
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">SKU</p>
                        <p className="font-medium text-foreground">{equipment.schema.sku}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="font-medium text-foreground">{equipment.schema.status || "Unknown"}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Size</p>
                        <p className="font-medium text-foreground">{equipment.schema.size ? `${equipment.schema.size}m` : "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Color</p>
                        <p className="font-medium text-foreground">{equipment.schema.color || "N/A"}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-medium text-foreground">{equipment.schema.category}</p>
                </div>
            </div>
        </>
    );
}

function EquipmentEditMode({ equipment, onCancel, onSubmit }: { equipment: EquipmentModel; onCancel: () => void; onSubmit: (data: any) => Promise<void> }) {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const categoryColor = categoryConfig?.color || equipmentEntity.color;

    const equipmentName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

    const initialFormData = {
        model: equipment.schema.model,
        sku: equipment.schema.sku,
        size: equipment.schema.size || "",
        color: equipment.schema.color || "",
        category: equipment.schema.category,
        status: equipment.schema.status,
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
                    <div className="flex-shrink-0" style={{ color: categoryColor }}>
                        {categoryConfig?.icon ? <categoryConfig.icon size={48} /> : <equipmentEntity.icon size={48} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-foreground">{equipmentName}</h3>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Created {formatDate(equipment.schema.createdAt)}
                        </div>
                    </div>
                </div>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: categoryColor }} />
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
                    style={{ borderColor: categoryColor }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${categoryColor}15`;
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
                        <label className="text-xs font-medium text-muted-foreground">Model</label>
                        <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Model"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">SKU</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="SKU"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Size (m)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Size"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Color</label>
                        <input
                            type="text"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Color"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Category"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Status</label>
                        <input
                            type="text"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Status"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export function EquipmentLeftColumn({ equipment }: { equipment: EquipmentModel }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (formData: any) => {
        const result = await updateEquipment(equipment.schema.id, formData);
        if (result.success) {
            setIsEditing(false);
        } else {
            console.error("Error updating equipment:", result.error);
        }
    };

    const content = isEditing ? (
        <EquipmentEditMode equipment={equipment} onCancel={() => setIsEditing(false)} onSubmit={handleSubmit} />
    ) : (
        <EquipmentViewMode equipment={equipment} onEdit={() => setIsEditing(true)} />
    );

    return <div className="space-y-4">{content}</div>;
}
