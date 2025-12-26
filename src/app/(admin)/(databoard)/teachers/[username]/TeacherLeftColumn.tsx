"use client";

import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { LessonProgressBadge } from "@/src/components/ui/badge/lessonprogress";
import { PaymentProgressBadge } from "@/src/components/ui/badge/paymentprogress";
import { TeacherIdStats } from "@/src/components/databoard/stats/TeacherIdStats";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import { Percent } from "lucide-react";
import type { TeacherModel } from "@/backend/models";
import type { LeftColumnCardData } from "@/types/left-column";

interface TeacherLeftColumnProps {
  teacher: TeacherModel;
}

export function TeacherLeftColumn({ teacher }: TeacherLeftColumnProps) {
  const credentials = useSchoolCredentials();
  const currency = credentials?.currency || "YEN";

  const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
  const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
  const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission")!;
  const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;
  const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

  const TeacherIcon = teacherEntity.icon;
  const LessonIcon = lessonEntity.icon;
  const CommissionIcon = commissionEntity.icon;
  const EquipmentIcon = equipmentEntity.icon;

  // Lesson Stats
  const lessons = teacher.relations?.lessons || [];
  const plannedLessons = lessons.filter(l => l.status === "active" || l.status === "rest").length;
  const completedLessons = lessons.filter(l => l.status === "completed").length;
  const uncompletedLessons = lessons.filter(l => l.status === "uncompleted").length;
  const totalLessons = lessons.length;
  const doneLessons = completedLessons + uncompletedLessons;

  // Calculate progress percentage for background gradient
  const progressPercentage = totalLessons > 0 ? (doneLessons / totalLessons) * 100 : 0;
  const progressBar = {
    background: `linear-gradient(to right, ${lessonEntity.color} ${progressPercentage}%, #e5e7eb ${progressPercentage}%)`,
  };

  // Teacher Stats
  const teacherStats = TeacherIdStats.getStats(teacher);
  const commissionsStats = teacherStats.find((stat) => stat.label === "Commissions");
  const revenueStats = teacherStats.find((stat) => stat.label === "Revenue");

  // Teacher Card
  const teacherCardData: LeftColumnCardData = {
    name: teacher.updateForm.username,
    status: teacher.updateForm.active ? "Active" : "Inactive",
    avatar: (
      <div className="flex-shrink-0" style={{ color: teacherEntity.color }}>
        <TeacherIcon className="w-10 h-10" />
      </div>
    ),
    fields: [
      {
        label: "First Name",
        value: teacher.updateForm.firstName,
      },
      {
        label: "Last Name",
        value: teacher.updateForm.lastName,
      },
      {
        label: "Passport",
        value: teacher.updateForm.passport,
      },
      {
        label: "Country",
        value: teacher.updateForm.country,
      },
      {
        label: "Phone",
        value: teacher.updateForm.phone,
      },
      {
        label: "Languages",
        value: teacher.updateForm.languages.join(", "),
      },
      {
        label: "Active",
        value: teacher.updateForm.active ? "Yes" : "No",
      },
      {
        label: "Created",
        value: formatDate(teacher.schema.createdAt),
      },
    ],
    accentColor: teacherEntity.color,
    isEditable: true,
  };

  // Lessons Card - Group by equipment category
  const categoryCount: Record<string, number> = {};
  lessons.forEach((lesson: any) => {
    const category = lesson.booking?.studentPackage?.schoolPackage?.categoryEquipment;
    if (category) {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
  });

  const lessonFields = Object.entries(categoryCount).map(([category, count]) => ({
    label: category,
    value: count.toString(),
  }));

  const lessonsCardData: LeftColumnCardData = {
    name: "Lessons",
    status: (
      <LessonProgressBadge
        planned={plannedLessons}
        completed={completedLessons}
        uncompleted={uncompletedLessons}
        background={progressBar.background}
      />
    ),
    avatar: (
      <div className="flex-shrink-0" style={{ color: lessonEntity.color }}>
        <LessonIcon className="w-10 h-10" />
      </div>
    ),
    fields: lessonFields.length > 0 ? lessonFields : [{ label: "Lessons", value: "No lessons found" }],
    accentColor: lessonEntity.color,
    isAddable: true,
  };

  // Commission Card
  const commissions = teacher.relations?.commissions || [];
  const commissionFields = commissions.map((commission) => ({
    label: commission.commissionType,
    value: `${commission.cph} ${currency}`,
  }));

  // Calculate commission ranges by type
  const fixedCommissions = commissions.filter(c => c.commissionType === "fixed").map(c => parseFloat(c.cph));
  const percentageCommissions = commissions.filter(c => c.commissionType === "percentage").map(c => parseFloat(c.cph));

  const commissionStatusElements = [];

  if (fixedCommissions.length > 0) {
    const min = Math.min(...fixedCommissions);
    const max = Math.max(...fixedCommissions);
    const range = min === max ? `${min}` : `${min}-${max}`;
    commissionStatusElements.push(
      <span key="fixed" className="inline-flex items-center gap-1">
        {range} {currency}
      </span>
    );
  }

  if (percentageCommissions.length > 0) {
    const min = Math.min(...percentageCommissions);
    const max = Math.max(...percentageCommissions);
    const range = min === max ? `${min}` : `${min}-${max}`;
    commissionStatusElements.push(
      <span key="percentage" className="inline-flex items-center gap-0.5">
        {range} <Percent size={14} />
      </span>
    );
  }

  const commissionStatus = commissionStatusElements.length > 0 ? (
    <div className="flex items-center gap-2">
      {commissionStatusElements.map((element, index) => (
        <span key={index} className="flex items-center gap-2">
          {element}
          {index < commissionStatusElements.length - 1 && <span className="text-muted-foreground">|</span>}
        </span>
      ))}
    </div>
  ) : "No commissions";

  const commissionCardData: LeftColumnCardData = {
    name: "Commissions",
    status: commissionStatus,
    avatar: (
      <div className="flex-shrink-0" style={{ color: commissionEntity.color }}>
        <CommissionIcon className="w-10 h-10" />
      </div>
    ),
    fields: commissionFields,
    accentColor: commissionEntity.color,
    isAddable: true,
  };

  // Payments Card
  const totalPaid = lessons.reduce((sum, lesson: any) => {
    const payments = lesson.teacherLessonPayments || [];
    const lessonPayments = payments.reduce((lessonSum: number, payment: any) => lessonSum + (payment.amount || 0), 0);
    return sum + lessonPayments;
  }, 0);

  const totalEarned = parseFloat(commissionsStats?.value || "0");
  const paymentProgressPercentage = totalEarned > 0 ? (totalPaid / totalEarned) * 100 : 0;
  const paymentProgressBar = {
    background: `linear-gradient(to right, ${paymentEntity.color} ${paymentProgressPercentage}%, #e5e7eb ${paymentProgressPercentage}%)`,
  };

  const paymentFields = lessons
    .filter((lesson: any) => lesson.teacherLessonPayments && lesson.teacherLessonPayments.length > 0)
    .flatMap((lesson: any) =>
      lesson.teacherLessonPayments.map((payment: any) => ({
        label: formatDate(payment.createdAt),
        value: `${payment.amount} ${currency}`,
      }))
    );

  const paymentCardData: LeftColumnCardData = {
    name: "Payments",
    status: (
      <PaymentProgressBadge
        paid={totalPaid}
        earned={totalEarned}
        currency={currency}
        background={paymentProgressBar.background}
      />
    ),
    avatar: (
      <div className="flex-shrink-0" style={{ color: paymentEntity.color }}>
        <CreditIcon size={40} />
      </div>
    ),
    fields: paymentFields.length > 0 ? paymentFields : [{ label: "Payments", value: "No payments received" }],
    accentColor: paymentEntity.color,
    isAddable: true,
  };

  // Equipment Card
  const equipments = teacher.relations?.equipments || [];

  // Group equipment by category and count
  const equipmentByCategory: Record<string, number> = {};
  equipments.forEach((te: any) => {
    const category = te.equipment?.category;
    if (category) {
      equipmentByCategory[category] = (equipmentByCategory[category] || 0) + 1;
    }
  });

  // Create status badge with equipment icons and counts
  const equipmentStatusElements = Object.entries(equipmentByCategory).map(([category, count]) => {
    const categoryConfig = EQUIPMENT_CATEGORIES.find(cat => cat.id === category);
    if (!categoryConfig) return null;

    const CategoryIcon = categoryConfig.icon;
    return (
      <div key={category} className="flex items-center gap-1.5">
        <div style={{ color: categoryConfig.color }}>
          <CategoryIcon size={16} />
        </div>
        <span className="text-sm text-foreground">{count}</span>
      </div>
    );
  }).filter(Boolean);

  const equipmentStatus = equipmentStatusElements.length > 0 ? (
    <div className="flex items-center gap-3">
      {equipmentStatusElements}
    </div>
  ) : "No equipment";

  // Create equipment fields
  const equipmentFields = equipments.map((te: any) => {
    const equipment = te.equipment;
    if (!equipment) return null;

    return {
      label: equipment.category,
      value: `${equipment.model} - ${equipment.sku}`,
    };
  }).filter(Boolean);

  const equipmentCardData: LeftColumnCardData = {
    name: "Equipment",
    status: equipmentStatus,
    avatar: (
      <div className="flex-shrink-0" style={{ color: equipmentEntity.color }}>
        <EquipmentIcon className="w-10 h-10" />
      </div>
    ),
    fields: equipmentFields.length > 0 ? equipmentFields : [{ label: "Equipment", value: "No equipment assigned" }],
    accentColor: equipmentEntity.color,
    isAddable: true,
  };

  return (
    <EntityLeftColumn
      cards={[teacherCardData, lessonsCardData, commissionCardData, paymentCardData, equipmentCardData]}
    />
  );
}
