import { type ReactNode } from "react";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import { getSchoolCredentials } from "@/src/components/NavAdrBarIconsServer";

interface ExampleLayoutProps {
    children: ReactNode;
}

export default async function ExampleLayout({ children }: ExampleLayoutProps) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            {children}
        </SchoolCredentialsProvider>
    );
}
