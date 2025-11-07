import { SchoolPackageForm } from "@/src/components/forms/SchoolPackageForm";

export default function CreateSchoolPackagePage() {
    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create Package</h1>
                <p className="text-muted-foreground mt-2">Add a new school package to the system</p>
            </div>
            <SchoolPackageForm />
        </div>
    );
}
