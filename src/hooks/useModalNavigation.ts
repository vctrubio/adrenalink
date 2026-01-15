import { useState, useMemo, useEffect } from "react";

interface UseModalNavigationProps<T> {
    items: T[];
    filterField: keyof T | ((item: T) => string);
    onSelect?: (item: T) => void;
    onShiftSelect?: (item: T) => void;
    onTabSelect?: (item: T) => void;
    isOpen: boolean;
    isActive?: boolean; // New prop to control listener
}

export function useModalNavigation<T extends { id: string }>({
    items,
    filterField,
    onSelect,
    onShiftSelect,
    onTabSelect,
    isOpen,
    isActive = true,
}: UseModalNavigationProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(0);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const query = searchQuery.toLowerCase();
        return items.filter((item) => {
            const value = typeof filterField === "function" ? filterField(item) : String(item[filterField]);
            return value.toLowerCase().includes(query);
        });
    }, [items, searchQuery, filterField]);

    // Reset focus when search changes or modal opens
    useEffect(() => {
        if (isOpen && isActive) {
            setFocusedIndex(0);
        }
    }, [searchQuery, isOpen, isActive]); // Added isActive to dependency to reset when becoming active? Maybe not desired for "Back" action.
    // Actually, when going back, we might want to preserve focus.
    // But for search changes, yes.
    // Let's refine: Reset focusedIndex only if searchQuery changes.
    // On open, we usually want reset or sync.
    // I'll keep it simple: reset on search change.

    useEffect(() => {
        setFocusedIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        if (!isOpen || !isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredItems.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedIndex((prev) => (prev + 1) % filteredItems.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                const focusedItem = filteredItems[focusedIndex];
                if (focusedItem) {
                    if (e.shiftKey && onShiftSelect) {
                        onShiftSelect(focusedItem);
                    } else if (onSelect) {
                        onSelect(focusedItem);
                    }
                }
            } else if (e.key === "Tab" && onTabSelect) {
                e.preventDefault();
                const focusedItem = filteredItems[focusedIndex];
                if (focusedItem) {
                    onTabSelect(focusedItem);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown, true); // Use capture phase
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [isOpen, isActive, filteredItems, focusedIndex, onSelect, onShiftSelect, onTabSelect]);

    return {
        searchQuery,
        setSearchQuery,
        filteredItems,
        focusedIndex,
        setFocusedIndex,
        selectedItem: filteredItems[focusedIndex],
    };
}
