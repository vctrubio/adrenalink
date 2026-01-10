"use client";

import { useState, useEffect } from "react";
import { Plus, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_LOCATIONS = ["BEACH", "FLAT", "BOAT"];
const STORAGE_KEY = "adrenalink-locations";

interface LocationManagerProps {
    selected: string;
    onSelect: (loc: string) => void;
}

export function LocationManager({ selected, onSelect }: LocationManagerProps) {
    const [locations, setLocations] = useState<string[]>(DEFAULT_LOCATIONS);
    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState("");

    // Load from local storage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        setLocations(Array.from(new Set([...DEFAULT_LOCATIONS, ...parsed])));
                    }
                } catch (e) {
                    console.error("Failed to parse locations", e);
                }
            }
        }
    }, []);

    // Ensure selected is in locations (sync from parent state)
    useEffect(() => {
        if (selected && !locations.includes(selected)) {
            setLocations((prev) => [...prev, selected]);
        }
    }, [selected, locations]);

    // Save to local storage whenever locations change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
        }
    }, [locations]);

    const handleAdd = () => {
        if (newValue.trim()) {
            const val = newValue.trim().toUpperCase();
            if (!locations.includes(val)) {
                setLocations([...locations, val]);
                onSelect(val);
            }
            setNewValue("");
            setIsAdding(false);
        }
    };

    const handleRemove = (loc: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newLocs = locations.filter((l) => l !== loc);
        setLocations(newLocs);
        if (selected === loc && newLocs.length > 0) {
            onSelect(newLocs[0]);
        } else if (newLocs.length === 0) {
            onSelect(""); // Or handle empty state
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Location</label>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-[10px] text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                >
                    <Plus size={10} />
                    {isAdding ? "CANCEL" : "ADD NEW"}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                    <div
                        key={loc}
                        onClick={() => onSelect(loc)}
                        className={`
                            group relative px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border
                            ${
                                selected === loc
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted hover:border-border/80"
                            }
                        `}
                    >
                        <div className="flex items-center gap-1.5">
                            <MapPin size={10} className={selected === loc ? "opacity-100" : "opacity-50"} />
                            {loc}
                        </div>

                        {/* Only show remove for non-defaults or if we want to allow hiding defaults too. 
                            Let's allow removing any location as requested. 
                        */}
                        <button
                            onClick={(e) => handleRemove(loc, e)}
                            className={`
                                absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full 
                                items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm
                                ${selected === loc ? "flex" : "hidden group-hover:flex"}
                            `}
                        >
                            <X size={8} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                autoFocus
                                type="text"
                                placeholder="ENTER LOCATION..."
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                className="flex-1 bg-background border border-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <button
                                onClick={handleAdd}
                                className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                            >
                                SAVE
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
