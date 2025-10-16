import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { schoolStudents } from "@/drizzle/schema";

interface SchoolStudentPageProps {
    params: { id: string };
}

export default async function SchoolStudentPage({ params }: SchoolStudentPageProps) {
    const relationshipId = params.id;
    
    try {
        const relationshipData = await db.query.schoolStudents.findFirst({
            where: eq(schoolStudents.id, relationshipId),
            with: {
                school: true,
                student: true
            }
        });

        if (!relationshipData) {
            return (
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-foreground mb-4">School-Student Relationship Not Found</h1>
                    <p className="text-muted-foreground">The relationship with ID {relationshipId} could not be found.</p>
                </div>
            );
        }

        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-8">School-Student Relationship</h1>
                <pre className="bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(relationshipData, null, 2)}
                </pre>
            </div>
        );
    } catch (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
                <p className="text-muted-foreground">Failed to fetch relationship data.</p>
            </div>
        );
    }
}