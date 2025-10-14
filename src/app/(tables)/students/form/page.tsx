import { WelcomeStudentForm } from "@/src/components/forms/WelcomeStudentForm";

export default function StudentFormsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Student Registration</h1>
        <p className="text-muted-foreground">Add a new student to the system</p>
      </div>
      <WelcomeStudentForm />
    </div>
  );
}