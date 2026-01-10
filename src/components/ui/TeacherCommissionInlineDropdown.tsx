"use client";

import { useState } from "react";
import { CommissionTypeValue } from "./badge/commission-type-value";
import { CreateCommissionInlineForm } from "./CreateCommissionInlineForm";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { motion, AnimatePresence } from "framer-motion";

interface Commission {
    id: string;
    commissionType: "fixed" | "percentage";
    cph: string;
    description: string | null;
}

interface TeacherCommissionInlineDropdownProps {
    teacherId: string;
    commissions: Commission[];
    selectedCommission: Commission | null;
    onSelectCommission: (commission: Commission) => void;
    onCommissionCreated: (commission: Commission) => void;
}

export function TeacherCommissionInlineDropdown({
    teacherId,
    commissions,
    selectedCommission,
    onSelectCommission,
    onCommissionCreated,
}: TeacherCommissionInlineDropdownProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-start">
                {commissions.map((commission) => (
                    <CommissionTypeValue
                        key={commission.id}
                        value={commission.cph}
                        type={commission.commissionType}
                        description={commission.description}
                        isSelected={selectedCommission?.id === commission.id}
                        onClick={() => onSelectCommission(commission)}
                    />
                ))}

                <AnimatePresence mode="wait">
                    {!isFormOpen ? (
                        <motion.button
                            key="add-button"
                            onClick={() => setIsFormOpen(true)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex-shrink-0"
                        >
                            <div style={{ color: "#10b981" }}>
                                <HandshakeIcon size={14} />
                            </div>
                            <span>Add</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="form-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/50 bg-emerald-500/10"
                        >
                            <div style={{ color: "#10b981" }}>
                                <HandshakeIcon size={14} />
                            </div>
                            <CreateCommissionInlineForm
                                teacherId={teacherId}
                                onSuccess={(commission) => {
                                    onCommissionCreated(commission);
                                    setIsFormOpen(false);
                                }}
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
