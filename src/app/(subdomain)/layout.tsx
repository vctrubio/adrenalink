import type { ReactNode } from "react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";

export default function TablesLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Breadcrumbs />
            <main>{children}</main>
        </div>
    );
}
