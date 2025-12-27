import { useState, useMemo, useEffect } from "react";

interface UseModalNavigationProps<T> {
    items: T[];
    filterField: keyof T | ((item: T) => string);
    onSelect?: (item: T) => void;
    onShiftSelect?: (item: T) => void;
    isOpen: boolean;
}

export function useModalNavigation<T extends { id: string }>({
    items,
    filterField,
    onSelect,
    onShiftSelect,
    isOpen,
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
        if (isOpen) {
            setFocusedIndex(0);
        }
    }, [searchQuery, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

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
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredItems, focusedIndex, onSelect, onShiftSelect]);

    return {
        searchQuery,
        setSearchQuery,
        filteredItems,
        focusedIndex,
        setFocusedIndex,
        selectedItem: filteredItems[focusedIndex],
    };
}
