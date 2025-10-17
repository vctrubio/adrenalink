"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, DollarSign, Users, Activity } from "lucide-react";
import { getCategoryConfig, getCategoryColors, type EquipmentCategory } from "@/config/categories";
import type { SerializedAbstractModel } from "@/backend/models";
import type { SchoolPackageType } from "@/drizzle/schema";

interface PackageCardProps {
    package: SerializedAbstractModel<SchoolPackageType>;
}

export default function PackageCard({ package: pkg }: PackageCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const categoryConfig = getCategoryConfig(pkg.schema.categoryEquipment as EquipmentCategory);
    const categoryColors = getCategoryColors(pkg.schema.categoryEquipment as EquipmentCategory);

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <categoryConfig.icon className="w-8 h-8" />
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors.bgColor} ${categoryColors.color} ${categoryColors.borderColor}`}>{categoryConfig.name.toUpperCase()}</span>
                            {(pkg as any).relations?.school && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Offered by <span className="font-medium text-foreground">@{(pkg as any).relations.school.username}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${pkg.schema.isPublic ? "bg-green-500" : "bg-orange-500"}`}></span>
                                <span className="text-xs text-muted-foreground">{pkg.schema.isPublic ? "Public" : "Private"}</span>
                                <span className={`w-2 h-2 rounded-full ${pkg.schema.active ? "bg-blue-500" : "bg-gray-400"}`}></span>
                                <span className="text-xs text-muted-foreground">{pkg.schema.active ? "Active" : "Inactive"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">${pkg.schema.pricePerStudent}</div>
                        <div className="text-sm text-muted-foreground">per student</div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-foreground">{pkg.lambda?.durationHours}h</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                            <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm font-medium text-foreground">{pkg.schema.capacityStudents}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                            <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-sm font-medium text-foreground">{pkg.schema.capacityEquipment}</div>
                        <div className="text-xs text-muted-foreground">Equipment</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-1">
                            <DollarSign className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium text-foreground">${pkg.lambda?.revenue}</div>
                        <div className="text-xs text-muted-foreground">Max Revenue</div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                    {pkg.schema.description && <p className="text-muted-foreground text-sm mb-2">{pkg.schema.description}</p>}
                    <p className="text-muted-foreground text-xs italic">{categoryConfig.description}</p>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="flex items-center justify-center pt-2 border-t border-muted/30">{isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-6 pb-6 border-t border-muted/30 bg-muted/20">
                    <div className="pt-4">
                        <h4 className="text-sm font-medium text-foreground mb-3">Package Analytics</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-card p-3 rounded-md border border-border">
                                <div className="text-xs text-muted-foreground mb-1">Price per Hour</div>
                                <div className="text-lg font-semibold text-foreground">${pkg.lambda?.studentPricePerHour?.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">per student</div>
                            </div>
                            <div className="bg-card p-3 rounded-md border border-border">
                                <div className="text-xs text-muted-foreground mb-1">Revenue per Hour</div>
                                <div className="text-lg font-semibold text-foreground">${pkg.lambda?.revenuePerHour?.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">max capacity</div>
                            </div>
                        </div>

                        {/* Package Details */}
                        <div className="mt-4 pt-4 border-t border-muted/30">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="ml-2 text-foreground">{new Date(pkg.schema.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Updated:</span>
                                    <span className="ml-2 text-foreground">{new Date(pkg.schema.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-4 border-t border-muted/30">
                            <Link href={`/packages/${pkg.schema.id}`} className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
                                View Package Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
