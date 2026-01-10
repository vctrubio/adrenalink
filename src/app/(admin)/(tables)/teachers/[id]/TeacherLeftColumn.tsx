"use client";

import { useState } from "react";
import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { LessonProgressBadge } from "@/src/components/ui/badge/lessonprogress";
import { PaymentProgressBadge } from "@/src/components/ui/badge/paymentprogress";
import { TeacherTableGetters } from "@/getters/table-getters";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { formatDate } from "@/getters/date-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { TeacherCommissionPanelModal } from "@/src/components/modals/admin/TeacherCommissionPanelModal";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { Percent } from "lucide-react";
import type { TeacherData } from "@/backend/data/TeacherData";
import type { LeftColumnCardData } from "@/types/left-column";

interface TeacherLeftColumnProps {
    teacher: TeacherData;
}

export function TeacherLeftColumn({ teacher }: TeacherLeftColumnProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";
    const [isCommissionPanelOpen, setIsCommissionPanelOpen] = useState(false);

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission")!;
    const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

    const TeacherIcon = teacherEntity.icon;
    const LessonIcon = lessonEntity.icon;
    const CommissionIcon = commissionEntity.icon;
    const EquipmentIcon = equipmentEntity.icon;

    // Lesson Stats - Use standardized snake_case relation
    const lessons = teacher.relations?.lesson || [];
    const plannedLessons = lessons.filter((l) => l.status === "active" || l.status === "planned").length;
    const completedLessons = lessons.filter((l) => l.status === "completed").length;
    const uncompletedLessons = lessons.filter((l) => l.status === "uncompleted").length;
    const totalLessons = lessons.length;
    const doneLessons = completedLessons + uncompletedLessons;

    // Calculate progress percentage for background gradient
    const progressPercentage = totalLessons > 0 ? (doneLessons / totalLessons) * 100 : 0;
    const progressBar = {
        background: `linear-gradient(to right, ${lessonEntity.color} ${progressPercentage}%, #e5e7eb ${progressPercentage}%)`,
    };

    // Teacher Card
    const teacherCardData: LeftColumnCardData = {
        name: teacher.schema.username,
        status: teacher.updateForm.active ? "Active" : "Inactive",
        avatar: (
            <div className="flex-shrink-0" style={{ color: teacherEntity.color }}>
                <TeacherIcon className="w-10 h-10" />
            </div>
        ),
        fields: [
            {
                label: "Username",
                value: teacher.schema.username,
            },
            {
                label: "First Name",
                value: teacher.schema.first_name,
            },
            {
                label: "Last Name",
                value: teacher.schema.last_name,
            },
            {
                label: "Passport",
                value: teacher.schema.passport,
            },
            {
                label: "Country",
                value: teacher.schema.country,
            },
            {
                label: "Phone",
                value: teacher.schema.phone,
            },
            {
                label: "Languages",
                value: teacher.schema.languages?.join(", ") || "",
            },
            {
                label: "Active",
                value: teacher.updateForm.active ? "Yes" : "No",
            },
            {
                label: "Created",
                value: formatDate(teacher.schema.created_at),
            },
        ],
        accentColor: teacherEntity.color,
        isEditable: true,
    };

    // Lessons Card - Group by equipment category
    const categoryCount: Record<string, number> = {};
    lessons.forEach((lesson: any) => {
        const category = lesson.booking?.school_package?.category_equipment;
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
    const commissions = teacher.relations?.teacher_commission || [];
    const commissionFields = commissions.map((commission) => ({
        label: commission.commission_type,
        value: `${commission.cph} ${currency}`,
    }));

    // Calculate commission ranges by type
    const fixedCommissions = commissions.filter((c) => c.commission_type === "fixed").map((c) => parseFloat(c.cph));
    const percentageCommissions = commissions.filter((c) => c.commission_type === "percentage").map((c) => parseFloat(c.cph));

    const commissionStatusElements = [];

    if (fixedCommissions.length > 0) {
        const min = Math.min(...fixedCommissions);
        const max = Math.max(...fixedCommissions);
        const range = min === max ? `${min}` : `${min}-${max}`;
        commissionStatusElements.push(
            <span key="fixed" className="inline-flex items-center gap-1">
                {range} {currency}
            </span>,
        );
    }

    if (percentageCommissions.length > 0) {
        const min = Math.min(...percentageCommissions);
        const max = Math.max(...percentageCommissions);
        const range = min === max ? `${min}` : `${min}-${max}`;
        commissionStatusElements.push(
            <span key="percentage" className="inline-flex items-center gap-0.5">
                {range} <Percent size={14} />
            </span>,
        );
    }

    const commissionStatus =
        commissionStatusElements.length > 0 ? (
            <div className="flex items-center gap-2">
                {commissionStatusElements.map((element, index) => (
                    <span key={index} className="flex items-center gap-2">
                        {element}
                        {index < commissionStatusElements.length - 1 && <span className="text-muted-foreground">|</span>}
                    </span>
                ))}
            </div>
        ) : (
            "No commissions"
        );

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
        isEditable: commissionFields.length > 0,
        onEdit: () => setIsCommissionPanelOpen(true),
    };

    // Payments Card
    const totalPaid = lessons.reduce((sum, lesson: any) => {
        const payments = lesson.teacher_lesson_payment || [];
        const lessonPayments = payments.reduce((lessonSum: number, payment: any) => lessonSum + (payment.amount || 0), 0);
        return sum + lessonPayments;
    }, 0);

    const totalEarned = TeacherTableGetters.getCommissionEarned(teacher);
    const paymentProgressPercentage = totalEarned > 0 ? (totalPaid / totalEarned) * 100 : 0;
    const paymentProgressBar = {
        background: `linear-gradient(to right, ${paymentEntity.color} ${paymentProgressPercentage}%, #e5e7eb ${paymentProgressPercentage}%)`,
    };

    const paymentFields = lessons
        .filter((lesson: any) => lesson.teacher_lesson_payment && lesson.teacher_lesson_payment.length > 0)
        .flatMap((lesson: any) =>
            lesson.teacher_lesson_payment.map((payment: any) => ({
                label: formatDate(payment.created_at),
                value: `${payment.amount} ${currency}`,
            })),
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
        fields: paymentFields,
        accentColor: paymentEntity.color,
        isAddable: true,
    };

    // Equipment Card
    const equipments = teacher.relations?.teacher_equipment || [];

    const equipmentByCategory: Record<string, number> = {};
    equipments.forEach((te: any) => {
        const category = te.equipment?.category;
        if (category) {
            equipmentByCategory[category] = (equipmentByCategory[category] || 0) + 1;
        }
    });

    const equipmentStatusElements = Object.entries(equipmentByCategory)
        .map(([category, count]) => {
            const categoryConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === category);
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
        })
        .filter(Boolean);

    const equipmentStatus =
        equipmentStatusElements.length > 0 ? <div className="flex items-center gap-3">{equipmentStatusElements}</div> : "No equipment";

    const equipmentFields = equipments
        .map((te: any) => {
            const equipment = te.equipment;
            if (!equipment) return null;

            return {
                label: equipment.category,
                value: `${equipment.model} - ${equipment.sku}`,
            };
        })
        .filter(Boolean);

    const equipmentCardData: LeftColumnCardData = {
        name: "Equipment",
        status: equipmentStatus,
        avatar: (
            <div className="flex-shrink-0" style={{ color: equipmentEntity.color }}>
                <EquipmentIcon className="w-10 h-10" />
            </div>
        ),
        fields: equipmentFields as any,
        accentColor: equipmentEntity.color,
        isAddable: true,
    };

    return (
        <>
            <EntityLeftColumn cards={[teacherCardData, lessonsCardData, commissionCardData, paymentCardData, equipmentCardData]} />
            <TeacherCommissionPanelModal
                isOpen={isCommissionPanelOpen}
                onClose={() => setIsCommissionPanelOpen(false)}
                teacherId={teacher.schema.id}
                teacherUsername={teacher.schema.username}
                commissions={teacher.relations?.teacher_commission || []}
                lessons={teacher.relations?.lesson || []}
                currency={currency}
            />
        </>
    );
}
