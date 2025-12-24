import { ReactNode } from "react";

interface RowActionProps {
    children?: ReactNode;
}

export const RowAction = ({ children }: RowActionProps) => {
    if (!children) return null;

    return (
        <div className="flex items-center gap-2">
            {children}
        </div>
    );
};
