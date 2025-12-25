import { Card, CardHeader } from "@/src/components/ui/card";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { ENTITY_DATA } from "@/config/entities";
import type { BookingModel } from "@/backend/models";

interface BookingPackageCardProps {
  booking: BookingModel;
}

export function BookingPackageCard({ booking }: BookingPackageCardProps) {
  const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
  const schoolPackage = booking.relations?.studentPackage?.schoolPackage;

  const PackageIcon = packageEntity.icon;

  if (!schoolPackage) {
    return null;
  }

  const equipmentCategory = schoolPackage.categoryEquipment;
  const equipmentCapacity = schoolPackage.capacityEquipment || 0;
  const studentCapacity = schoolPackage.capacityStudents || 0;
  const packageDurationHours = schoolPackage.durationMinutes ? Math.round(schoolPackage.durationMinutes / 60) : 0;
  const durationHours = schoolPackage.durationMinutes ? schoolPackage.durationMinutes / 60 : 0;
  const pricePerHour = durationHours > 0 ? (schoolPackage.pricePerStudent || 0) / durationHours : 0;

  const packageFields = [
    {
      label: "Description",
      value: schoolPackage.description || "No description",
    },
    {
      label: "Type",
      value: schoolPackage.packageType || "Unknown",
    },
  ];

  return (
    <Card accentColor={packageEntity.color}>
      <CardHeader
        name={`Package ${schoolPackage.id.slice(0, 8)}`}
        status="School Package"
        avatar={
          <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
            <PackageIcon className="w-10 h-10" />
          </div>
        }
        accentColor={packageEntity.color}
      />
      <div className="mb-6">
        <EquipmentStudentPackagePriceBadge
          categoryEquipment={equipmentCategory}
          equipmentCapacity={equipmentCapacity}
          studentCapacity={studentCapacity}
          packageDurationHours={packageDurationHours}
          pricePerHour={pricePerHour}
        />
      </div>
      <CardList fields={packageFields} />
    </Card>
  );
}
