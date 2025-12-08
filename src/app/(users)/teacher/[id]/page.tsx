import { getTeachers } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";

interface TeacherPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: TeacherPageProps) {
	const { id: teacherId } = await params;

	// Get school from subdomain header
	const schoolHeader = await getSchoolHeader();

	// Fetch teacher data
	const result = await getTeachers();

	if (!result.success) {
		return <div className="p-4 text-destructive">Error loading teacher data</div>;
	}

	const teacher = result.data.find((t) => t.schema.id === teacherId);

	if (!teacher) {
		return <div className="p-4 text-destructive">Teacher not found</div>;
	}

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-2">
				Hello {teacher.schema.firstName} {teacher.schema.lastName}
			</h2>
			{schoolHeader && (
				<p className="text-muted-foreground">
					Welcome to {schoolHeader.name}
				</p>
			)}
		</div>
	);
}
