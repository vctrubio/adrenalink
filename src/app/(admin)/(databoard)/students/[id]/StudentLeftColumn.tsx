"use client";

import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { LessonEventRevenueBadge } from "@/src/components/ui/badge/lesson-event-revenue";
import { StudentIdStats } from "@/src/components/databoard/stats/StudentIdStats";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import type { StudentModel } from "@/backend/models";
import type { LeftColumnCardData } from "@/types/left-column";

interface StudentLeftColumnProps {
  student: StudentModel;
}

export function StudentLeftColumn({ student }: StudentLeftColumnProps) {
  const credentials = useSchoolCredentials();
  const currency = credentials?.currency || "YEN";

  const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
  const packageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
  const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
  const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;

  const StudentIcon = studentEntity.icon;
  const PackageIcon = packageEntity.icon;
  const BookingIcon = bookingEntity.icon;

  // Student Card
  const studentCardData: LeftColumnCardData = {
    name: `${student.updateForm.firstName} ${student.updateForm.lastName}`,
    status: student.updateForm.active ? "Active" : "Inactive",
    avatar: (
      <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
        <StudentIcon className="w-10 h-10" />
      </div>
    ),
    fields: [
      {
        label: "Passport",
        value: student.updateForm.passport,
      },
      {
        label: "Country",
        value: student.updateForm.country,
      },
      {
        label: "Phone",
        value: student.updateForm.phone,
      },
      {
        label: "Languages",
        value: student.updateForm.languages.join(", "),
      },
      {
        label: "Active",
        value: student.updateForm.active ? "Yes" : "No",
      },
      {
        label: "Rental",
        value: student.updateForm.rental ? "Yes" : "No",
      },
      {
        label: "Created",
        value: formatDate(student.schema.createdAt),
      },
    ],
    accentColor: studentEntity.color,
    isEditable: true,
  };

  // Packages Card
  const studentPackageStudents = student.relations?.studentPackageStudents || [];
  const packages = studentPackageStudents.map((sps: any) => sps.studentPackage).filter(Boolean);

  // Group packages by status
  const requestedPackages = packages.filter((p: any) => p.status === "requested").length;
  const acceptedPackages = packages.filter((p: any) => p.status === "accepted").length;
  const rejectedPackages = packages.filter((p: any) => p.status === "rejected").length;
  const totalPackages = packages.length;

  // Calculate progress percentage (accepted / total)
  const packageProgressPercentage = totalPackages > 0 ? (acceptedPackages / totalPackages) * 100 : 0;
  const packageProgressBar = {
    background: `linear-gradient(to right, ${packageEntity.color} ${packageProgressPercentage}%, #e5e7eb ${packageProgressPercentage}%)`,
  };

  const packageFields = packages.map((pkg: any) => ({
    label: pkg.schoolPackage?.description || "Unknown Package",
    value: pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1),
  }));

  const packagesCardData: LeftColumnCardData = {
    name: "Packages",
    status: (
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: packageProgressBar.background }} />
        <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
          {acceptedPackages}/{totalPackages}
        </span>
      </div>
    ),
    avatar: (
      <div className="flex-shrink-0" style={{ color: packageEntity.color }}>
        <PackageIcon className="w-10 h-10" />
      </div>
    ),
    fields: packageFields.length > 0 ? packageFields : [{ label: "Packages", value: "No packages" }],
    accentColor: packageEntity.color,
    isAddable: true,
  };

  // Bookings Card
  const bookingStudents = student.relations?.bookingStudents || [];
  const bookings = bookingStudents.map((bs: any) => bs.booking).filter(Boolean);

  // Calculate lesson count, total event duration, and money spent
  let totalLessonCount = 0;
  let totalEventDuration = 0;
  let totalMoneySpent = 0;

  bookings.forEach((booking: any) => {
    const lessons = booking.lessons || [];
    totalLessonCount += lessons.length;

    const packageDuration = booking.studentPackage?.schoolPackage?.durationMinutes || 0;
    const pricePerStudent = booking.studentPackage?.schoolPackage?.pricePerStudent || 0;

    lessons.forEach((lesson: any) => {
      const events = lesson.events || [];
      const lessonDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
      totalEventDuration += lessonDuration;

      // Calculate money spent for this lesson
      if (packageDuration > 0) {
        const lessonCost = (pricePerStudent * lessonDuration) / packageDuration;
        totalMoneySpent += lessonCost;
      }
    });
  });

  const bookingFields = bookings.map((booking: any) => ({
    label: booking.studentPackage?.schoolPackage?.description || "Unknown Package",
    value: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
  }));

  const bookingsCardData: LeftColumnCardData = {
    name: "Bookings",
    status: (
      <LessonEventRevenueBadge
        lessonCount={totalLessonCount}
        duration={getFullDuration(totalEventDuration)}
        revenue={Math.round(totalMoneySpent)}
      />
    ),
    avatar: (
      <div className="flex-shrink-0" style={{ color: bookingEntity.color }}>
        <BookingIcon className="w-10 h-10" />
      </div>
    ),
    fields: bookingFields.length > 0 ? bookingFields : [{ label: "Bookings", value: "No bookings" }],
    accentColor: bookingEntity.color,
    isAddable: true,
  };

  // Payments Card
  const payments = student.relations?.bookingPayments || [];
  const totalPaymentsMade = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);

  // Calculate due: money spent on bookings - payments made
  const due = Math.round(totalMoneySpent - totalPaymentsMade);

  const paymentFields = payments.map((payment: any) => ({
    label: formatDate(payment.createdAt),
    value: payment.amount.toString(),
  }));

  const paymentsCardData: LeftColumnCardData = {
    name: "Payments",
    status: `${due} ${currency} Due`,
    avatar: (
      <div className="flex-shrink-0" style={{ color: paymentEntity.color }}>
        <CreditIcon size={40} />
      </div>
    ),
    fields: paymentFields,
    accentColor: paymentEntity.color,
    isAddable: true,
  };

  return (
    <EntityLeftColumn
      cards={[studentCardData, packagesCardData, bookingsCardData, paymentsCardData]}
    />
  );
}
