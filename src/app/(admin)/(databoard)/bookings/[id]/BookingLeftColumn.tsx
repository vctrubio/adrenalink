"use client";

import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingProgressBadge } from "@/src/components/ui/badge/bookingprogress";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { BookingIdStats } from "@/src/components/databoard/stats/BookingIdStats";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { ENTITY_DATA } from "@/config/entities";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import type { BookingModel } from "@/backend/models";
import type { LeftColumnCardData } from "@/types/left-column";

interface BookingLeftColumnProps {
  booking: BookingModel;
  usedMinutes: number;
  totalMinutes: number;
  progressBar: { background: string };
}

export function BookingLeftColumn({ booking, usedMinutes, totalMinutes, progressBar }: BookingLeftColumnProps) {
  const credentials = useSchoolCredentials();
  const currency = credentials?.currency || "YEN";

  const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
  const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
  const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
  const receiptEntity = ENTITY_DATA.find((e) => e.id === "payment")!;

  const bookingStudents = booking.relations?.bookingStudents || [];
  const schoolPackage = booking.relations?.studentPackage?.schoolPackage;
  const studentPackage = booking.relations?.studentPackage;

  const StudentIcon = studentEntity.icon;
  const PackageIcon = packageEntity.icon;
  const BookingIcon = bookingEntity.icon;

  // Student Fields
  const sortedBookingStudents = [...bookingStudents].sort((a, b) => {
    const aName = a.student ? `${a.student.firstName} ${a.student.lastName}` : "Unknown";
    const bName = b.student ? `${b.student.firstName} ${b.student.lastName}` : "Unknown";
    const aIsLeader = aName === booking.schema.leaderStudentName;
    const bIsLeader = bName === booking.schema.leaderStudentName;
    return aIsLeader ? -1 : bIsLeader ? 1 : 0;
  });

  const studentFields = sortedBookingStudents.map((bs, index) => {
    const studentName = bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown";
    const studentId = bs.student?.id;
    const isLeader = studentName === booking.schema.leaderStudentName;
    return {
      label: isLeader ? "Leader" : String(index + 1),
      value: studentId ? (
        <HoverToEntity entity={studentEntity} id={studentId}>
          {studentName}
        </HoverToEntity>
      ) : (
        studentName
      ),
    };
  });

  // Package Fields
  const packageDurationHours = schoolPackage?.durationMinutes ? Math.round(schoolPackage.durationMinutes / 60) : 0;
  const durationHours = schoolPackage?.durationMinutes ? schoolPackage.durationMinutes / 60 : 0;
  const pricePerHour = durationHours > 0 ? (schoolPackage?.pricePerStudent || 0) / durationHours : 0;

  const packageFields = studentPackage
    ? [
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
      ]
    : [];

  // Payment Fields
  const paymentFields =
    booking.relations?.studentBookingPayments && booking.relations.studentBookingPayments.length > 0
      ? booking.relations.studentBookingPayments.map((payment) => ({
          label: formatDate(payment.createdAt),
          value: payment.amount + " " + currency,
        }))
      : [{ label: "Payments", value: "No Payments done" }];

  // Stats
  const bookingStats = BookingIdStats.getStats(booking);
  const dueStat = bookingStats.find((stat) => stat.label === "Due");
  const due = dueStat?.value || 0;

  // Card Data
  const bookingCardData: LeftColumnCardData = {
    name: <DateRangeBadge startDate={booking.schema.dateStart} endDate={booking.schema.dateEnd} />,
    status: <BookingProgressBadge usedMinutes={usedMinutes} totalMinutes={totalMinutes} background={progressBar.background} />,
    avatar: (
      <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
        <BookingIcon className="w-10 h-10" />
      </div>
    ),
    fields: [
      {
        label: "Status",
        value: booking.schema.status || "Unknown",
      },
      {
        label: "Created",
        value: formatDate(booking.schema.createdAt),
      },
    ],
    accentColor: bookingEntity.color,
  };

  const leaderCardData: LeftColumnCardData = {
    name: booking.schema.leaderStudentName,
    status: "Leader",
    avatar: (
      <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
        <StudentIcon className="w-10 h-10" />
      </div>
    ),
    fields: studentFields.length > 0 ? studentFields : [{ label: "Students", value: "No students assigned" }],
    accentColor: studentEntity.color,
    isEditable: true,
  };

  const packageCardData: LeftColumnCardData | null = schoolPackage
    ? {
        name: schoolPackage.description || "No Package",
        status: (
          <EquipmentStudentPackagePriceBadge
            categoryEquipment={schoolPackage.categoryEquipment}
            equipmentCapacity={schoolPackage.capacityEquipment || 0}
            studentCapacity={schoolPackage.capacityStudents || 0}
            packageDurationHours={packageDurationHours}
            pricePerHour={pricePerHour}
          />
        ),
        avatar: (
          <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
            <PackageIcon className="w-10 h-10" />
          </div>
        ),
        fields: packageFields,
        accentColor: packageEntity.color,
        isEditable: false,
      }
    : null;

  const paymentCardData: LeftColumnCardData = {
    name: "Payments",
    status: `${due} ${currency} Due`,
    avatar: (
      <div className="flex-shrink-0" style={{ color: receiptEntity.color }}>
        <CreditIcon size={40} />
      </div>
    ),
    fields: paymentFields,
    accentColor: receiptEntity.color,
    isAddable: true,
  };

  return (
    <EntityLeftColumn
      header={`Booking ${booking.schema.id.slice(0, 4)}`}
      cards={[bookingCardData, leaderCardData, packageCardData, paymentCardData]}
    />
  );
}
