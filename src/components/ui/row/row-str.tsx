"use client";

import { ReactNode, useState } from "react";
import { Dropdown } from "@/src/components/ui/dropdown";
import { DropdownDictItem, type DropdownDictItemProps } from "@/src/components/ui/dropdown";
import DropdownBullsIcon from "@/public/appSvgs/DropdownBullsIcon.jsx";

interface RowStrProps {
    label: ReactNode;
    items: {
        label: string;
        value: string | number;
    }[];
    entityColor: string;
}

export const RowStr = ({ label, items, entityColor }: RowStrProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const dropdownItems: DropdownDictItemProps[] = items.map((item) => ({
        id: item.label,
        label: item.label,
        value: item.value,
    }));

    return (
        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors border-2 ${
                    isOpen ? "bg-muted" : ""
                } hover:bg-muted`}
                style={{ borderColor: entityColor }}
            >
                <span>{label}</span>
                <DropdownBullsIcon className="text-muted-foreground" size={12} />
            </button>
            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                items={dropdownItems}
                align="right"
                renderItem={(item, onClose) => (
                    <DropdownDictItem item={item as DropdownDictItemProps} onClose={onClose} />
                )}
            />
        </div>
    );
};
