"use client";

import { MapPin, Trash2, Plus as PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import Dropdown from "./dropdown/dropdown";
import type { DropdownItemProps } from "./dropdown/dropdown-item";

interface LocationPickerProps {
    value: string | null;
    options: string[];
    onChange: (newValue: string) => void;
    onOptionsChange: (newOptions: string[]) => void;
    noBg?: boolean;
    className?: string;
}

export function LocationPicker({ value, options, onChange, onOptionsChange, noBg = false, className = "" }: LocationPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [newLocation, setNewLocation] = useState("");

    const addLocation = () => {
        if (newLocation.trim() && !options.includes(newLocation.trim())) {
            const updated = [newLocation.trim(), ...options];
            onOptionsChange(updated);
            onChange(newLocation.trim());
            setNewLocation("");
        }
    };

    const removeLocation = (locToRemove: string) => {
        const updated = options.filter((l) => l !== locToRemove);
        onOptionsChange(updated);

        // If we removed the currently selected one, select the first available
        if (value === locToRemove && updated.length > 0) {
            onChange(updated[0]);
        }
    };

    const dropdownItems: DropdownItemProps[] = [
        // Add location input item (custom render)
        {
            id: "add-location",
            label: "Add location...",
            icon: PlusIcon,
            onClick: () => {},
        },
        ...options.map((loc) => ({
            id: loc,
            label: loc,
            icon: MapPin,
            active: value === loc,
            onClick: () => {
                onChange(loc);
                setIsOpen(false);
            },
        })),
    ];

    return (
        <div className={`relative w-full ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={`text-lg font-bold text-foreground hover:text-primary transition-all px-4 py-1 rounded w-full text-center truncate bg-transparent outline-none border-none ${
                    noBg ? "" : "hover:bg-muted/50"
                }`}
            >
                {value || "---"}
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                items={dropdownItems}
                triggerRef={buttonRef as React.RefObject<HTMLElement>}
                align="center"
                renderItem={(item, onClose) => {
                    if (item.id === "add-location") {
                        return (
                            <div className="p-2 border-b border-border/30 flex gap-1 bg-card" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addLocation();
                                        }
                                    }}
                                    placeholder="Add location..."
                                    className="flex-1 bg-muted/30 text-xs px-2 py-1 rounded outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addLocation();
                                    }}
                                    disabled={!newLocation.trim()}
                                    className="p-1 hover:bg-primary hover:text-white rounded disabled:opacity-50 transition-colors"
                                >
                                    <PlusIcon size={14} />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div className="flex items-center justify-between group">
                            <button
                                onClick={() => {
                                    item.onClick?.();
                                    onClose();
                                }}
                                className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                    item.active ? "font-bold text-primary" : "text-muted-foreground group-hover:text-primary"
                                }`}
                            >
                                {item.icon && (
                                    <div className="flex-shrink-0">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                )}
                                <span className="flex-1">{item.label}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeLocation(item.id as string);
                                }}
                                className="p-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    );
                }}
            />
        </div>
    );
}
