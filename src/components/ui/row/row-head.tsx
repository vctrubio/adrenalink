import { ReactNode } from "react";
import { DropdownLabel, type DropdownItemProps } from "@/src/components/ui/dropdown";

interface RowHeadProps {
    avatar: ReactNode;
    name: string | ReactNode;
    status: string | ReactNode;
    dropdownItems?: DropdownItemProps[];
    statusColor?: string;
    statusDisabled?: boolean;
}

export const RowHead = ({ avatar, name, status, dropdownItems, statusColor, statusDisabled }: RowHeadProps) => {
    return (
        <div
            className="flex items-center gap-4"
            onClick={(e) => {
                if (dropdownItems) {
                    e.stopPropagation();
                }
            }}
        >
            <div className="flex-shrink-0 avatar-wrapper">{avatar}</div>
            <div>
                <div className="text-base font-semibold text-foreground">{name}</div>
                {dropdownItems && statusColor ? <DropdownLabel value={status} items={dropdownItems} color={statusColor} disabled={statusDisabled} /> : <div className="bg-muted px-3 text-sm rounded-2xl text-center">{status}</div>}
            </div>
        </div>
    );
};
