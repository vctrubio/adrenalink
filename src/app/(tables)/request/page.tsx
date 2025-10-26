import { EntityCard } from "@/src/components/cards/EntityCard";
import { getStudentPackageRequests } from "@/actions/student-package-action";
import type { StudentPackageModel } from "@/backend/models";

export default async function RequestPage() {
    const result = await getStudentPackageRequests();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-8 border-b border-border">
                <EntityCard entityId="studentPackage" count={result.data.length} />
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                    {result.data.length === 0 ? (
                        <p className="text-muted-foreground">No package requests found</p>
                    ) : (
                        result.data.map((request) => (
                            <div key={request.schema.id} className="border-4 rounded-lg p-6 transition-all duration-200 shadow-md hover:shadow-lg" style={{ borderColor: "#fcd34d" }}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            Request #{request.schema.id.slice(0, 8)}
                                        </h3>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>Student: {request.relations?.student?.name || "N/A"}</p>
                                            <p>Package: {request.relations?.schoolPackage?.description || "N/A"}</p>
                                            <p>School: {request.relations?.schoolPackage?.school?.name || "N/A"}</p>
                                            <p>Dates: {request.schema.requestedDateStart} to {request.schema.requestedDateEnd}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.schema.status === "accepted" ? "bg-green-100 text-green-800" : request.schema.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                                            {request.schema.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
