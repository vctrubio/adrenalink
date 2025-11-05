import { ReactNode } from "react";

interface CardBodyProps {
    children: ReactNode;
}

export const CardBody = ({ children }: CardBodyProps) => {
    return <div className="space-y-3">{children}</div>;
};
