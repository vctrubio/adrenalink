import { ReactNode } from "react";

interface ClassboardLayoutProps {
    children: ReactNode;
}

export default function ClassboardLayout({ children }: ClassboardLayoutProps) {
    return (
        <>
            {children}
        </>
    );
}