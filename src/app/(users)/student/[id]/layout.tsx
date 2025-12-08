import { getStudents } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";
import UserNavBar from "@/src/components/navigations/users/UserNavBar";

interface LayoutProps {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
}

export default async function StudentLayout({
	params,
	children,
}: LayoutProps) {
	const { id } = await params;

	// Fetch student data
	const result = await getStudents();

	if (!result.success) {
		return <div className="p-6 text-destructive">Error loading student data</div>;
	}

	const student = result.data.find((s) => s.schema.id === id);

	if (!student) {
		return <div className="p-6 text-destructive">Student not found</div>;
	}

	const schoolHeader = await getSchoolHeader();

	return (
		<div>
			<UserNavBar
				schoolUsername={schoolHeader?.name}
				userRole="student"
				userId={id}
				firstName={student.schema.firstName}
				lastName={student.schema.lastName}
			/>
			<div className="container mx-auto px-6">
				{children}
			</div>
		</div>
	);
}
