"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { ENTITY_DATA } from "@/config/entities";
import { ReferralStats, getReferralCode, getReferralCommissionValue } from "@/getters/referrals-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { ReferralModel } from "@/backend/models";

interface ReferralRowProps {
    item: ReferralModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const ReferralRow = ({ item: referral, isExpanded, onToggle }: ReferralRowProps) => {
    const referralEntity = ENTITY_DATA.find((e) => e.id === "referral")!;
    const ReferralIcon = referralEntity.icon;
    const entityColor = referralEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const status = referral.schema.active ? "Active Referral" : "Inactive Referral";

    const strItems = [
        { label: "Code", value: getReferralCode(referral) },
        { label: "Commission Type", value: referral.schema.commissionType },
        { label: "Commission Value", value: getReferralCommissionValue(referral) },
        { label: "Description", value: referral.schema.description || "-" },
    ];

    const stats: StatItem[] = [
        { value: ReferralStats.getStudentCount(referral), label: "Students" },
        { value: ReferralStats.getEventsCount(referral), label: "Events" },
        { value: getPrettyDuration(referral.stats?.total_duration_minutes || 0), label: "Duration" },
        { value: `$${ReferralStats.getMoneyIn(referral)}`, label: "Income" },
        { value: `$${ReferralStats.getMoneyOut(referral)}`, label: "Commission" },
        { value: `$${ReferralStats.getRevenue(referral)}`, label: "Revenue" },
    ];

    return (
        <Row
            id={referral.schema.id}
            entityData={referral.schema}
            entityBgColor={referralEntity.bgColor}
            entityColor={referralEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <ReferralIcon className="w-10 h-10" />
                    </div>
                ),
                name: getReferralCode(referral),
                status,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            stats={stats}
        />
    );
};
