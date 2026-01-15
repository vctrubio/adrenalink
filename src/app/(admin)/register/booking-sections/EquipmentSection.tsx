"use client";

import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

interface EquipmentSectionProps {
    selectedEquipmentCategory: string | null;
    onSelect: (category: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onExpand?: () => void;
    packageCategoryCounts?: Record<string, number>;
}

export function EquipmentSection({
    selectedEquipmentCategory,
    onSelect,
    isExpanded,
    onToggle,
    onExpand,
    packageCategoryCounts = {},
}: EquipmentSectionProps) {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment");
    const selectedCategory = selectedEquipmentCategory
        ? EQUIPMENT_CATEGORIES.find((cat) => cat.id === selectedEquipmentCategory)
        : null;
    const CategoryIcon = selectedCategory?.icon;

    const title = selectedCategory ? selectedCategory.name : "Select Equipment";

    return (
        <Section
            id="equipment-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={CategoryIcon || equipmentEntity?.icon}
            entityColor={selectedCategory?.color || equipmentEntity?.color}
            state={{
                isSelected: selectedEquipmentCategory !== null,
            }}
            hasSelection={selectedEquipmentCategory !== null}
            onClear={() => onSelect(null as any)}
            onExpand={onExpand}
        >
            <div className="flex flex-wrap gap-4">
                {EQUIPMENT_CATEGORIES.map((cat) => {
                    const CategoryIcon = cat.icon;
                    const isSelected = selectedEquipmentCategory === cat.id;
                    const count = packageCategoryCounts[cat.id] || 0;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                                onSelect(cat.id);
                                onToggle();
                            }}
                            className={`
                                flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300
                                ${
                                    isSelected
                                        ? "bg-card border-border text-foreground shadow-sm"
                                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                                }
                            `}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    isSelected ? "bg-muted" : "bg-muted/50"
                                }`}
                            >
                                <CategoryIcon className="w-5 h-5" style={{ color: cat.color }} />
                            </div>
                            <span className="text-lg font-black uppercase tracking-tight">{cat.name}</span>
                            <span className="text-sm font-semibold text-muted-foreground">({count})</span>
                        </button>
                    );
                })}
            </div>
        </Section>
    );
}
