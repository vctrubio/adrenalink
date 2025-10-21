import { ReactNode } from "react";
import { Breadcrumbs } from "@/src/components/navigations/Breadcrumbs";
import Navbar from "@/src/components/navigations/Navbar";

interface TablesLayoutProps {
    children: ReactNode;
}

export default function TablesLayout({ children }: TablesLayoutProps) {
    return (
        <div>
            <Navbar />
            <Breadcrumbs />
            <main>{children}</main>
        </div>
    );
}
