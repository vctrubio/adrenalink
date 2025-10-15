import { ReactNode } from "react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";

interface TablesLayoutProps {
    children: ReactNode;
}

export default function TablesLayout({ children }: TablesLayoutProps) {
    return (
        <div>
            <Breadcrumbs />
            <main>{children}</main>
        </div>
    );
}
