import { getStudents } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import Link from "next/link";

export default async function StudentsPage() {
    const result = await getStudents();

    if (!result.success) {
        return (
            <>
                <InfoHeader title="Students" />
                <div>Error loading students</div>
            </>
        );
    }

    const students = result.data;

    return (
        <>
            <InfoHeader title="Students" />
            <div className="flex flex-col gap-2">
                {students.map((student) => (
                    <Link
                        key={student.schema.id}
                        href={`/info/students/${student.schema.id}`}
                        className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h3 className="font-semibold">
                            {student.schema.firstName} {student.schema.lastName}
                        </h3>
                    </Link>
                ))}
            </div>
        </>
    );
}
