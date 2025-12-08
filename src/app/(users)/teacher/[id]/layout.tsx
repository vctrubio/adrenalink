import { getTeachers } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";
import UserNavBar from "@/src/components/navigations/users/UserNavBar";

interface LayoutProps {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
}

export default async function TeacherLayout({
	params,
	children,
}: LayoutProps) {
	const { id } = await params;

	// Fetch teacher data
	const result = await getTeachers();

	if (!result.success) {
		return <div className="p-6 text-destructive">Error loading teacher data</div>;
	}

	const teacher = result.data.find((t) => t.schema.id === id);

	if (!teacher) {
		return <div className="p-6 text-destructive">Teacher not found</div>;
	}

	const schoolHeader = await getSchoolHeader();

	return (
		<div>
			<UserNavBar
				schoolUsername={schoolHeader?.name}
				userRole="teacher"
				userId={id}
				firstName={teacher.schema.firstName}
				lastName={teacher.schema.lastName}
			/>
			<div className="container mx-auto px-6">
				{children}
			</div>
		</div>
	);
}
