import { getStudents } from "@/actions/student-action";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import Link from "next/link";

export default async function StudentPage() {
	const result = await getStudents();

	if (!result.success) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold text-foreground mb-4">Students</h1>
				<p className="text-destructive">Error: {result.error}</p>
			</div>
		);
	}

	const students = result.data;

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-foreground mb-6">Students</h1>

			<div className="space-y-2">
				{students.length === 0 ? (
					<p className="text-muted-foreground">No students found</p>
				) : (
					students.map((student) => (
						<Link
							key={student.schema.id}
							href={`/student/${student.schema.id}`}
							className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary transition-colors"
						>
							<HelmetIcon size={20} />
							<div className="flex flex-col">
								<span className="font-medium text-foreground">
									{student.schema.firstName} {student.schema.lastName}
								</span>
								<span className="text-xs text-muted-foreground">
									{student.schema.passport}
								</span>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
