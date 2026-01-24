import { type ReactNode, Suspense } from "react";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import NavAdrBarShell from "@/src/components/NavAdrBarShell";
import { RightIconsServer } from "@/src/components/NavAdrBarIconsServer";
import { NavIconsSkeleton, NavIconsRightSkeleton } from "@/src/components/NavAdrBarIcons";
import NavIns from "@/src/components/NavIns";
import { getUserSchoolContext } from "@/types/user-school-provider";
import { ClerkUserDropdown } from "@/src/components/auth/ClerkUserDropdown";

interface UsersLayoutProps {
    children: ReactNode;
}

export default async function UsersLayout({ children }: UsersLayoutProps) {
    const context = await getUserSchoolContext();
    const serverRole = context.user?.role;
    
    // Transform context school into credentials format for provider
    const credentials = context.school ? {
        id: context.school.id,
        name: context.school.username, // Using username as name placeholder if needed
        username: context.school.username,
        logoUrl: "/prototypes/north-icon.png", // Fallback logo
        bannerUrl: "/kritaps_ungurs_unplash/forest.jpg",
        currency: "EUR",
        status: "active",
        timezone: context.school.timezone
    } : null;

    return (
        <SchoolCredentialsProvider credentials={credentials as any}>
            {/* Shell with Adrenalink is ALWAYS visible - never suspended */}
            <NavAdrBarShell
                leftSlot={
                    <Suspense fallback={<NavIconsSkeleton />}>
                        <ClerkUserDropdown serverRole={serverRole} />
                    </Suspense>
                }
                rightSlot={
                    <Suspense fallback={<NavIconsRightSkeleton />}>
                        <RightIconsServer />
                    </Suspense>
                }
            />
            <main className="pt-24 pb-20 md:pb-32 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
            <NavIns />
        </SchoolCredentialsProvider>
    );
}
