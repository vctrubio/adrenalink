import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface TeacherPageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: TeacherPageProps) {
    const { id: teacherId } = await params;

    // Redirect to events page as the default view
    redirect(`/teacher/${teacherId}/events`);
}
