"use client";

import { useRouter } from "next/navigation";
import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { UpdateEntityColumnCard } from "@/src/components/ids/UpdateEntityColumnCard";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { schoolPackageUpdateSchema, type SchoolPackageUpdateForm } from "@/src/validation/school-package";
import { updateSchoolPackage, deleteSchoolPackage } from "@/supabase/server/packages";
import type { PackageData } from "@/backend/data/PackageData";
import type { LeftColumnCardData } from "@/types/left-column";

interface PackageLeftColumnProps {
    packageData: PackageData;
}

export function PackageLeftColumn({ packageData }: PackageLeftColumnProps) {
    const router = useRouter();
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const studentPackageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;

    const PackageIcon = packageEntity.icon;
    const StudentPackageIcon = studentPackageEntity.icon;

    const pkg = packageData.schema;

    // Form handlers
    const handleUpdateSubmit = async (data: SchoolPackageUpdateForm) => {
        const result = await updateSchoolPackage(pkg.id, {
            description: data.description,
            is_public: data.is_public,
            active: data.active,
        });

        if (result.success) {
            router.refresh();
        } else {
            console.error("Failed to update package:", result.error);
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        const result = await deleteSchoolPackage(pkg.id);

        if (result.success) {
            router.push("/packages");
        } else {
            console.error("Failed to delete package:", result.error);
            throw new Error(result.error);
        }
    };

    // Check if package can be deleted
    const bookings = packageData.relations?.booking || [];
    const requests = packageData.relations?.requests || [];
    const canDeletePackage = bookings.length === 0 && requests.length === 0;
    const deleteMessage = canDeletePackage
        ? "Are you sure you want to delete this package?"
        : "Cannot delete package with bookings or student requests";

    // Form fields
    const formFields = [
        { name: "is_public", label: "Public", type: "switch" as const, section: "settings", description: "Available to students" },
        { name: "active", label: "Active", type: "switch" as const, section: "settings", description: "Package is active" },
        { name: "description", label: "Description", type: "textarea" as const, section: "details", required: true },
    ];

    const defaultValues: SchoolPackageUpdateForm = {
        id: pkg.id,
        description: pkg.description,
        is_public: pkg.is_public,
        active: pkg.active,
    };

    // Package calculations
    const durationHours = pkg.duration_minutes ? pkg.duration_minutes / 60 : 0;
    const pricePerHour = durationHours > 0 ? (pkg.price_per_student || 0) / durationHours : 0;
    const totalRevenue = (pkg.price_per_student || 0) * (pkg.capacity_students || 0) * durationHours;

    // Status badges
    const statusElements = [];
    if (pkg.is_public) {
        statusElements.push("Public");
    }
    if (pkg.active) {
        statusElements.push("Active");
    }
    const packageStatus = statusElements.length > 0 ? statusElements.join(" | ") : "Inactive";

    // View mode fields
    const packageViewFields = [
        {
            label: "Description",
            value: pkg.description,
        },
        {
            label: "Category",
            value: pkg.category_equipment ? pkg.category_equipment.charAt(0).toUpperCase() + pkg.category_equipment.slice(1) : "",
        },
        {
            label: "Equipment Capacity",
            value: pkg.capacity_equipment?.toString() || "0",
        },
        {
            label: "Student Capacity",
            value: pkg.capacity_students?.toString() || "0",
        },
        {
            label: "Duration",
            value: getPrettyDuration(pkg.duration_minutes),
        },
        {
            label: "Price / Student",
            value: `${pkg.price_per_student} ${currency}`,
        },
        {
            label: "Price / Hour",
            value: `${Math.round(pricePerHour)} ${currency}`,
        },
        {
            label: "Total Revenue",
            value: `${Math.round(totalRevenue)} ${currency}`,
        },
        {
            label: "Type",
            value: pkg.package_type ? pkg.package_type.charAt(0).toUpperCase() + pkg.package_type.slice(1) : "",
        },
        {
            label: "Public",
            value: pkg.is_public ? "Yes" : "No",
        },
        {
            label: "Active",
            value: pkg.active ? "Yes" : "No",
        },
        {
            label: "Created",
            value: formatDate(pkg.created_at),
        },
    ];

    // Student Packages Card (Requests)
    // Calculate stats for requests
    const requested = requests.filter((r) => r.status === "requested").length;
    const accepted = requests.filter((r) => r.status === "accepted").length;
    const totalRequests = requests.length;

    // Calculate progress percentage (accepted / total)
    const progressPercentage = totalRequests > 0 ? (accepted / totalRequests) * 100 : 0;
    const requestProgressBarBackground = `linear-gradient(to right, ${studentPackageEntity.color} ${progressPercentage}%, #e5e7eb ${progressPercentage}%)`;

    // Individual request fields
    const requestFields = requests.map((r) => {
        const status = r.status.charAt(0).toUpperCase() + r.status.slice(1);
        const referralCode = r.referral?.code || "Direct";
        return {
            label: `${formatDate(r.created_at)} | ${referralCode}`,
            value: status,
        };
    });

    const requestsCardData: LeftColumnCardData = {
        name: "Requests",
        status: (
            <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: requestProgressBarBackground }} />
                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
                    {accepted}/{totalRequests}
                </span>
            </div>
        ),
        avatar: (
            <div className="flex-shrink-0" style={{ color: studentPackageEntity.color }}>
                <StudentPackageIcon className="w-10 h-10" />
            </div>
        ),
        fields: requestFields.length > 0 ? requestFields : [{ label: "Requests", value: "No requests yet" }],
        accentColor: studentPackageEntity.color,
        isAddable: true,
    };

    return (
        <div className="space-y-6">
            <UpdateEntityColumnCard
                name={pkg.description || "Package"}
                status={packageStatus}
                avatar={
                    <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
                        <PackageIcon className="w-10 h-10" />
                    </div>
                }
                fields={packageViewFields}
                accentColor={packageEntity.color}
                entityId="schoolPackage"
                formFields={formFields}
                schema={schoolPackageUpdateSchema}
                defaultValues={defaultValues}
                onSubmit={handleUpdateSubmit}
                onDelete={handleDelete}
                canDelete={canDeletePackage}
                deleteMessage={deleteMessage}
            />
            <EntityLeftColumn cards={[requestsCardData]} />
        </div>
    );
}
