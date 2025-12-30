import { type ReactNode, Suspense } from "react";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import NavAdrBarShell from "@/src/components/NavAdrBarShell";
import { LeftIconsServer, RightIconsServer, getSchoolCredentials } from "@/src/components/NavAdrBarIconsServer";
import { NavIconsSkeleton, NavIconsRightSkeleton } from "@/src/components/NavAdrBarIcons";
import NavIns from "@/src/components/NavIns";

interface UsersLayoutProps {
    children: ReactNode;
}

export default async function UsersLayout({ children }: UsersLayoutProps) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            {/* Shell with Adrenalink is ALWAYS visible - never suspended */}
            <NavAdrBarShell
                leftSlot={
                    <Suspense fallback={<NavIconsSkeleton />}>
                        <LeftIconsServer />
                    </Suspense>
                }
                rightSlot={
                    <Suspense fallback={<NavIconsRightSkeleton />}>
                        <RightIconsServer />
                    </Suspense>
                }
            />
            <main className="pt-24 pb-20 md:pb-32 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <NavIns />
        </SchoolCredentialsProvider>
    );
}
