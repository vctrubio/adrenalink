import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface StudentPageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { id: studentId } = await params;

    // Redirect to bookings page as the default view
    redirect(`/student/${studentId}/bookings`);
}
