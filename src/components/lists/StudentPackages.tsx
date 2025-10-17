"use client";

import { useState } from "react";
import type { SerializedAbstractModel } from "@/backend/models";
import type { StudentPackageType } from "@/drizzle/schema";
import { acceptStudentPackageRequest, rejectStudentPackageRequest } from "@/actions/student-package-action";
import { Clock, User, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface StudentPackagesProps {
    studentPackageRequests: SerializedAbstractModel<StudentPackageType>[];
}

export default function StudentPackages({ studentPackageRequests }: StudentPackagesProps) {
    const [studentPackages, setStudentPackages] = useState(studentPackageRequests);

    const getStatusIcon = (status: string) => {
        switch (status) {
        case "accepted":
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        case "rejected":
            return <XCircle className="w-4 h-4 text-red-600" />;
        default:
            return <AlertCircle className="w-4 h-4 text-orange-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
        case "accepted":
            return "bg-green-100 text-green-800 border-green-200";
        case "rejected":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-orange-100 text-orange-800 border-orange-200";
        }
    };


    if (studentPackages.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No student package requests found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {studentPackages.map((studentPackage) => (
                <div key={studentPackage.schema.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(studentPackage.schema.status)}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(studentPackage.schema.status)}`}>
                                    {studentPackage.schema.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Requested: {new Date(studentPackage.schema.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium text-foreground">Student</div>
                                <div className="text-xs text-muted-foreground">
                                    {(studentPackage as any).relations?.student?.name || "Unknown Student"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium text-foreground">Dates</div>
                                <div className="text-xs text-muted-foreground">
                                    {studentPackage.schema.requestedDateStart} to {studentPackage.schema.requestedDateEnd}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium text-foreground">Package</div>
                                <div className="text-xs text-muted-foreground">
                                    {(studentPackage as any).relations?.schoolPackage?.categoryEquipment || "Unknown Package"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {studentPackage.schema.status === "requested" && (
                        <div className="mt-4 pt-4 border-t border-muted/30">
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                                    onClick={async () => {
                                        const result = await acceptStudentPackageRequest(studentPackage.schema.id);
                                        if (!result.error) {
                                            // Update local state optimistically
                                            setStudentPackages(prev => 
                                                prev.map(pkg => 
                                                    pkg.schema.id === studentPackage.schema.id 
                                                        ? { ...pkg, schema: { ...pkg.schema, status: "accepted" as const } }
                                                        : pkg
                                                )
                                            );
                                        }
                                    }}
                                >
                                    Accept
                                </button>
                                <button
                                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    onClick={async () => {
                                        const result = await rejectStudentPackageRequest(studentPackage.schema.id);
                                        if (!result.error) {
                                            // Update local state optimistically
                                            setStudentPackages(prev => 
                                                prev.map(pkg => 
                                                    pkg.schema.id === studentPackage.schema.id 
                                                        ? { ...pkg, schema: { ...pkg.schema, status: "rejected" as const } }
                                                        : pkg
                                                )
                                            );
                                        }
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}