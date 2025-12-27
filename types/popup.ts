import { ReactNode } from "react";

export interface PopUpItem {
    id: string;
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    isActive?: boolean;
    color?: string;
}

export interface PopUpSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export interface PopUpHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    className?: string;
}

export interface PopUpRowsProps<T extends PopUpItem> {
    items: T[];
    renderItem: (item: T, isSelected: boolean) => ReactNode;
    selectedId?: string;
    onSelect?: (item: T) => void;
    className?: string;
}
