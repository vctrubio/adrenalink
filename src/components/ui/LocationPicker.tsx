"use client";

import { MapPin, Trash2, Plus as PlusIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationPickerProps {
    value: string | null;
    options: string[];
    onChange: (newValue: string) => void;
    onOptionsChange: (newOptions: string[]) => void;
    noBg?: boolean;
    className?: string;
}

export function LocationPicker({
    value,
    options,
    onChange,
    onOptionsChange,
    noBg = false,
    className = "",
}: LocationPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [newLocation, setNewLocation] = useState("");

    const addLocation = () => {
        if (newLocation && !options.includes(newLocation)) {
            const updated = [newLocation, ...options];
            onOptionsChange(updated);
            onChange(newLocation);
            setNewLocation("");
        }
    };

    const removeLocation = (e: React.MouseEvent, locToRemove: string) => {
        e.stopPropagation();
        const updated = options.filter((l) => l !== locToRemove);
        onOptionsChange(updated);
        
        // If we removed the currently selected one, select the first available
        if (value === locToRemove && updated.length > 0) {
            onChange(updated[0]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = Math.max(rect.width, 160);
            let left = rect.left;

            if (left + dropdownWidth > window.innerWidth - 16) {
                left = window.innerWidth - dropdownWidth - 16;
            }
            if (left < 16) left = 16;

            setDropdownRect({
                top: rect.bottom + 8,
                left,
                width: dropdownWidth,
            });
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`text-lg font-bold text-foreground hover:text-primary transition-all px-4 py-1 rounded w-full text-center truncate bg-transparent outline-none border-none ${
                    noBg ? "" : "hover:bg-muted/50"
                }`}
            >
                {value || "---"}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bg-card border border-border rounded-lg shadow-xl z-[100] overflow-hidden flex flex-col max-h-[250px]"
                        style={{ 
                            top: `${dropdownRect.top}px`, 
                            left: `${dropdownRect.left}px`, 
                            width: `${dropdownRect.width}px` 
                        }}
                    >
                        <div className="p-2 border-b border-border/30 flex gap-1 bg-card">
                            <input
                                type="text"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addLocation()}
                                placeholder="Add..."
                                className="flex-1 bg-muted/30 text-xs px-2 py-1 rounded outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button 
                                onClick={(e) => { e.stopPropagation(); addLocation(); }} 
                                disabled={!newLocation} 
                                className="p-1 hover:bg-primary hover:text-white rounded disabled:opacity-50 transition-colors"
                            >
                                <PlusIcon size={14} />
                            </button>
                        </div>
                        <div className="overflow-y-auto py-1">
                            {options.map((loc) => (
                                <div 
                                    key={loc} 
                                    className={`flex items-center justify-between group hover:bg-muted/30 ${
                                        value === loc ? "bg-muted/50" : ""
                                    }`}
                                >
                                    <button 
                                        onClick={() => { onChange(loc); setIsOpen(false); }} 
                                        className={`flex-1 px-3 py-2 text-sm text-left truncate ${
                                            value === loc ? "font-bold text-primary" : "text-muted-foreground group-hover:text-primary"
                                        }`}
                                    >
                                        {loc}
                                    </button>
                                    <button 
                                        onClick={(e) => removeLocation(e, loc)} 
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
