import { Card, CardHeader } from "@/src/components/ui/card";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { formatDate } from "@/getters/date-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { BookingModel } from "@/backend/models";

interface BookingV2LeftColumnProps {
  booking: BookingModel;
}

export function BookingV2LeftColumn({ booking }: BookingV2LeftColumnProps) {
  const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
  const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
  const bookingStudents = booking.relations?.bookingStudents || [];
  const schoolPackage = booking.relations?.studentPackage?.schoolPackage;
  const studentPackage = booking.relations?.studentPackage;

  const StudentIcon = studentEntity.icon;
  const PackageIcon = packageEntity.icon;

  const studentFields = bookingStudents.map((bs) => {
    const studentName = bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown";
    const isLeader = studentName === booking.schema.leaderStudentName;
    return {
      label: isLeader ? "Leader" : studentName,
      value: isLeader ? studentName : "",
    };
  });

  const packageDurationHours = schoolPackage?.durationMinutes ? Math.round(schoolPackage.durationMinutes / 60) : 0;
  const durationHours = schoolPackage?.durationMinutes ? schoolPackage.durationMinutes / 60 : 0;
  const pricePerHour = durationHours > 0 ? (schoolPackage?.pricePerStudent || 0) / durationHours : 0;

  return (
    <>
      <Card accentColor={studentEntity.color}>
        <CardHeader
          name={booking.schema.leaderStudentName}
          status="Leader"
          avatar={
            <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
              <StudentIcon className="w-10 h-10" />
            </div>
          }
          accentColor={studentEntity.color}
        />
        <CardList fields={studentFields.length > 0 ? studentFields : [{ label: "Students", value: "No students assigned" }]} />
      </Card>

      {schoolPackage && (
        <Card accentColor={packageEntity.color}>
          <CardHeader
            name={schoolPackage.description || "No Package"}
            status={
              <EquipmentStudentPackagePriceBadge
                categoryEquipment={schoolPackage.categoryEquipment}
                equipmentCapacity={schoolPackage.capacityEquipment || 0}
                studentCapacity={schoolPackage.capacityStudents || 0}
                packageDurationHours={packageDurationHours}
                pricePerHour={pricePerHour}
              />
            }
            avatar={
              <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
                <PackageIcon className="w-10 h-10" />
              </div>
            }
            accentColor={packageEntity.color}
          />
          {studentPackage && (
            <CardList
              fields={[
                {
                  label: "Status",
                  value: studentPackage.status || "Unknown",
                },
                {
                  label: "Requested Start",
                  value: formatDate(studentPackage.requestedDateStart),
                },
                {
                  label: "Requested End",
                  value: formatDate(studentPackage.requestedDateEnd),
                },
                {
                  label: "Referral",
                  value: studentPackage.relations?.referral?.code || "None",
                },
                {
                  label: "Wallet ID",
                  value: studentPackage.walletId.slice(0, 8),
                },
              ]}
            />
          )}
        </Card>
      )}
    </>
  );
}
