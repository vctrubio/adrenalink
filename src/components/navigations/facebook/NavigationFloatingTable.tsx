"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ENTITY_DATA, type EntityConfig } from "@/config/entities";
import { Search, Command } from "lucide-react";

interface NavigationFloatingTableProps {
    isOpen: boolean;
    onClose: () => void;
}

const DATABOARD_ENTITIES = [
    "student",
    "teacher",
    "booking",
    "event",
    "equipment",
    "rental",
    "referral",
    "studentPackage",
    "schoolPackage",
    "payment",
    "commission",
    "lesson",
    "repairs",
];

export const NavigationFloatingTable = ({ isOpen, onClose }: NavigationFloatingTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const databoardEntities = useMemo(
        () =>
            ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id)).map((entity) => ({
                ...entity,
                databoardLink: `/facebook/databoard/${entity.id}`,
            })),
        [],
    );

    const filteredEntities = useMemo(() => {
        if (!searchQuery.trim()) return databoardEntities;
        const query = searchQuery.toLowerCase();
        return databoardEntities.filter(
            (entity) =>
                entity.name.toLowerCase().includes(query) ||
                entity.id.toLowerCase().includes(query) ||
                entity.description.some((desc) => desc.toLowerCase().includes(query)),
        );
    }, [searchQuery, databoardEntities]);

    // Reset selection when filtered results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredEntities.length]);

    // Focus search input when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSelectedIndex(0);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Scroll selected item into view
    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [selectedIndex]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % filteredEntities.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + filteredEntities.length) % filteredEntities.length);
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredEntities[selectedIndex]) {
                        handleNavigate(filteredEntities[selectedIndex].databoardLink);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, filteredEntities, onClose]);

    const handleNavigate = (link: string) => {
        router.push(link);
        onClose();
    };

    if (!isOpen) return null;

    console.log("NavigationFloatingTable rendering, isOpen:", isOpen);

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm animate-in fade-in duration-200" 
                onClick={onClose} 
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/4 -translate-x-1/2 z-[9999] w-full max-w-2xl animate-in fade-in slide-in-from-top-8 duration-300">
                <div className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search databoard entities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                                <Command className="h-3 w-3 inline" />
                            </kbd>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">J</kbd>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {filteredEntities.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">No entities found</div>
                        ) : (
                            <div className="py-2">
                                {filteredEntities.map((entity, index) => {
                                    const Icon = entity.icon;
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <div
                                            key={entity.id}
                                            ref={(el) => (itemRefs.current[index] = el)}
                                            onClick={() => handleNavigate(entity.databoardLink)}
                                            className={`
                                                flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors
                                                ${isSelected ? "bg-accent" : "hover:bg-accent/50"}
                                            `}
                                        >
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: entity.bgColor }}
                                            >
                                                <Icon className="h-5 w-5" style={{ color: entity.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-foreground">{entity.name}</div>
                                                <div className="text-sm text-muted-foreground truncate">
                                                    {entity.description[0]}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">↵</kbd>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↵</kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">Esc</kbd>
                                Close
                            </span>
                        </div>
                        <div>{filteredEntities.length} entities</div>
                    </div>
                </div>
            </div>
        </>
    );
};
