"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface RegisterLayoutClientProps {
    children: ReactNode;
}

export default function RegisterLayoutClient({ children }: RegisterLayoutClientProps) {
    const pathname = usePathname();

    // Determine if this is a sub-route (not the main /register page)
    const isSubRoute = pathname !== "/register";

    // If it's the main register page, just render children (MasterBookingForm handles its own layout)
    if (!isSubRoute) {
        return <>{children}</>;
    }

    // For sub-routes, just render the children
    // The page component itself will handle rendering the controller and content
    return <>{children}</>;
}
