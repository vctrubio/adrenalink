"use client";

import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { SchoolPackageModel } from "@/backend/models";
import type { LeftColumnCardData } from "@/types/left-column";

interface PackageLeftColumnV2Props {
  schoolPackage: SchoolPackageModel;
}

export function PackageLeftColumnV2({ schoolPackage }: PackageLeftColumnV2Props) {
  const credentials = useSchoolCredentials();
  const currency = credentials?.currency || "YEN";

  const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
  const studentPackageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;

  const PackageIcon = packageEntity.icon;
  const StudentPackageIcon = studentPackageEntity.icon;

  // Package calculations
  const durationHours = schoolPackage.schema.durationMinutes ? schoolPackage.schema.durationMinutes / 60 : 0;
  const pricePerHour = durationHours > 0 ? (schoolPackage.schema.pricePerStudent || 0) / durationHours : 0;

  // Status badges
  const statusElements = [];
  if (schoolPackage.schema.isPublic) {
    statusElements.push("Public");
  }
  if (schoolPackage.schema.active) {
    statusElements.push("Active");
  }
  const packageStatus = statusElements.length > 0 ? statusElements.join(" | ") : "Inactive";

  // Package Card
  const packageCardData: LeftColumnCardData = {
    name: schoolPackage.schema.description || "Package",
    status: packageStatus,
    avatar: (
      <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
        <PackageIcon className="w-10 h-10" />
      </div>
    ),
    fields: [
      {
        label: "Equipment Category",
        value: schoolPackage.schema.categoryEquipment,
      },
      {
        label: "Equipment Capacity",
        value: schoolPackage.schema.capacityEquipment?.toString() || "0",
      },
      {
        label: "Student Capacity",
        value: schoolPackage.schema.capacityStudents?.toString() || "0",
      },
      {
        label: "Duration",
        value: getPrettyDuration(schoolPackage.schema.durationMinutes),
      },
      {
        label: "Price Per Student",
        value: `${schoolPackage.schema.pricePerStudent} ${currency}`,
      },
      {
        label: "Price Per Hour",
        value: `${Math.round(pricePerHour)} ${currency}`,
      },
      {
        label: "Package Type",
        value: schoolPackage.schema.packageType,
      },
      {
        label: "Created",
        value: formatDate(schoolPackage.schema.createdAt),
      },
    ],
    accentColor: packageEntity.color,
    isEditable: true,
  };

  // Student Packages Card
  const studentPackages = schoolPackage.relations?.studentPackages || [];

  // Calculate stats for progress bar
  const requested = studentPackages.filter((sp: any) => sp.status === "requested").length;
  const accepted = studentPackages.filter((sp: any) => sp.status === "accepted").length;
  const rejected = studentPackages.filter((sp: any) => sp.status === "rejected").length;
  const totalRequests = studentPackages.length;

  // Calculate progress percentage (accepted / total)
  const progressPercentage = totalRequests > 0 ? (accepted / totalRequests) * 100 : 0;
  const requestProgressBar = {
    background: `linear-gradient(to right, ${studentPackageEntity.color} ${progressPercentage}%, #e5e7eb ${progressPercentage}%)`,
  };

  // Individual request fields with date and status
  const studentPackageFields = studentPackages.map((sp: any) => {
    const status = sp.status.charAt(0).toUpperCase() + sp.status.slice(1);
    const referralId = sp.referral?.id || "N/A";
    return {
      label: `${formatDate(sp.createdAt)} | ${referralId}`,
      value: status,
    };
  });

  const studentPackageCardData: LeftColumnCardData = {
    name: "Requests",
    status: (
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: requestProgressBar.background }} />
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
    fields: studentPackageFields.length > 0 ? studentPackageFields : [{ label: "Requests", value: "No requests created" }],
    accentColor: studentPackageEntity.color,
    isAddable: true,
  };

  return (
    <EntityLeftColumn
      header={`Package ${schoolPackage.schema.id.slice(0, 4)}`}
      cards={[packageCardData, studentPackageCardData]}
    />
  );
}
