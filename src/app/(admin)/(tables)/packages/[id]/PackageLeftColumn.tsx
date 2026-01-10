"use client";

import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { PackageData } from "@/backend/data/PackageData";
import type { LeftColumnCardData } from "@/types/left-column";

interface PackageLeftColumnProps {
    packageData: PackageData;
}

export function PackageLeftColumn({ packageData }: PackageLeftColumnProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const studentPackageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;

    const PackageIcon = packageEntity.icon;
    const StudentPackageIcon = studentPackageEntity.icon;

    const pkg = packageData.schema;

    // Package calculations
    const durationHours = pkg.duration_minutes ? pkg.duration_minutes / 60 : 0;
    const pricePerHour = durationHours > 0 ? (pkg.price_per_student || 0) / durationHours : 0;

    // Status badges
    const statusElements = [];
    if (pkg.is_public) {
        statusElements.push("Public");
    }
    if (pkg.active) {
        statusElements.push("Active");
    }
    const packageStatus = statusElements.length > 0 ? statusElements.join(" | ") : "Inactive";

    // Package Card
    const packageCardData: LeftColumnCardData = {
        name: pkg.description || "Package",
        status: packageStatus,
        avatar: (
            <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
                <PackageIcon className="w-10 h-10" />
            </div>
        ),
        fields: [
            {
                label: "Category",
                value: pkg.category_equipment,
            },
            {
                label: "Eq Capacity",
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
                label: "Type",
                value: pkg.package_type,
            },
            {
                label: "Created",
                value: formatDate(pkg.created_at),
            },
        ],
        accentColor: packageEntity.color,
        isEditable: true,
    };

    // Student Packages Card (Requests)
    const requests = packageData.relations?.requests || [];

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

    return <EntityLeftColumn cards={[packageCardData, requestsCardData]} />;
}
