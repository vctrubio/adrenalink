import type { ReactNode } from "react";

export interface LeftColumnCardData {
    name: string | ReactNode;
    status: ReactNode;
    avatar: ReactNode;
    fields: { label: string; value: string | ReactNode }[];
    accentColor: string;
    isEditable?: boolean;
    isAddable?: boolean;
    onEdit?: () => void;
    onAdd?: () => void;
}
