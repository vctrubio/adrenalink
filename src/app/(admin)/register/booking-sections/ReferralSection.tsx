import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { ReferralTable } from "@/src/components/tables/ReferralTable";
import { ReferralCommissionBadge } from "@/src/components/ui/badge";

interface Referral {
    id: string;
    code: string;
    description: string | null;
    commissionType: string;
    commissionValue: string;
    active: boolean;
}

interface ReferralSectionProps {
    referrals: Referral[];
    selectedReferral: Referral | null;
    onSelect: (referral: Referral | null) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onClose?: () => void;
}

export function ReferralSection({ referrals, selectedReferral, onSelect, isExpanded, onToggle, onClose }: ReferralSectionProps) {
    const referralEntity = ENTITY_DATA.find((e) => e.id === "referral");
    const title = selectedReferral ? (
        <div className="flex items-center gap-2">
            <span>{selectedReferral.code}</span>
            <ReferralCommissionBadge value={selectedReferral.commissionValue} type={selectedReferral.commissionType} />
        </div>
    ) : (
        "Referral"
    );

    const safeReferrals = referrals || [];

    return (
        <Section
            id="referral-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={referralEntity?.icon}
            entityColor={referralEntity?.color}
            optional={true}
            hasSelection={selectedReferral !== null}
            onClear={() => onSelect(null)}
            onOptional={onClose}
        >
            <ReferralTable referrals={safeReferrals} selectedReferral={selectedReferral} onSelect={onSelect} />
        </Section>
    );
}
