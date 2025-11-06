import { ReactNode } from "react";

interface RowActionProps {
    children?: ReactNode;
}

export const RowAction = ({ children }: RowActionProps) => {
    if (!children) return null;

    return (
        <div className="flex items-center justify-center">
            {children}
        </div>
    );
};
