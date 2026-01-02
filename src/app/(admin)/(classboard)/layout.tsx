import { getClassboardBookings } from "@/actions/classboard-action";
import { ReactNode } from "react";
import { ClassboardProvider } from "../../../providers/classboard-provider";

interface ClassboardLayoutProps {
    children: ReactNode;
}

export default async function ClassboardLayout({ children }: ClassboardLayoutProps) {
    const result = await getClassboardBookings();

    if (!result.success) {
        return (
            <div>
                <h1>Class Board error to tbd</h1>
                <p>Error: {result.error}</p>
            </div>
        );
    }

    return (
        <ClassboardProvider initialClassboardModel={result.data}>
            {children}
        </ClassboardProvider>
    );
}
