import { InfoHeader } from "../../InfoHeader";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <>
            <InfoHeader title={`Lesson ${id}`} />
            <div className="space-y-4">
                {/* Lesson details will go here */}
            </div>
        </>
    );
}
