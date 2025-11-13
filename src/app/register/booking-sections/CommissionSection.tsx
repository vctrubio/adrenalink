import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";

interface Commission {
    id: string;
    commissionType: string;
    cph: number;
}

interface CommissionSectionProps {
    commissions: Commission[];
    selectedCommission: Commission | null;
    onSelect: (commission: Commission) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

export function CommissionSection({ commissions, selectedCommission, onSelect, isExpanded, onToggle }: CommissionSectionProps) {
    const commissionEntity = ENTITY_DATA.find(e => e.id === "commission");
    const title = selectedCommission 
        ? `Commission: €${selectedCommission.cph}/h` 
        : "Select Commission";

    return (
        <Section
            id="commission-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={commissionEntity?.icon}
            entityColor={commissionEntity?.color}
        >
            <div className="grid gap-3">
                {commissions.map((commission) => {
                    const isSelected = selectedCommission?.id === commission.id;
                    
                    return (
                        <button
                            key={commission.id}
                            type="button"
                            onClick={() => onSelect(commission)}
                            className={`p-4 text-left rounded-lg border-2 transition-all ${
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background hover:border-primary/50"
                            }`}
                        >
                            <div className="font-medium text-foreground mb-1 capitalize">
                                {commission.commissionType} Commission
                            </div>
                            <div className="text-sm text-muted-foreground">
                                €{commission.cph} per hour
                            </div>
                        </button>
                    );
                })}
            </div>
        </Section>
    );
}
