"use client";

import { useState } from "react";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import { StudentPackageConfirmation } from "@/src/components/modals/StudentPackageConfirmation";
import { StudentPackageRequestRow } from "@/src/components/tables/StudentPackageRequestRow";

interface InvitationsTableProps {
    invitations: StudentPackageRequest[];
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
    const [selectedInvitation, setSelectedInvitation] = useState<StudentPackageRequest | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    if (invitations.length === 0) {
        return (
            <div className="text-center p-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="font-bold text-zinc-400 uppercase tracking-widest">No pending invitations</p>
            </div>
        );
    }

    const handleOpenModal = (invitation: StudentPackageRequest) => {
        setSelectedInvitation(invitation);
        setIsConfirmationModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsConfirmationModalOpen(false);
        setSelectedInvitation(null);
    };

    const handleConfirmationSuccess = () => {
        setIsConfirmationModalOpen(false);
        setSelectedInvitation(null);
    };

    return (
        <>
            <div className="w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-separate border-spacing-y-4">
                        <thead className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 tracking-widest font-bold">
                            <tr>
                                <th className="px-8 py-2 w-[48%]">Package Details</th>
                                <th className="px-6 py-2 w-[32%]">Booking Dates</th>
                                <th className="px-6 py-2 text-right w-[30%]">Request From</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.map((invitation) => (
                                <StudentPackageRequestRow key={invitation.id} invitation={invitation} onAccept={() => handleOpenModal(invitation)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal - Outside table */}
            {selectedInvitation && (
                <StudentPackageConfirmation
                    isOpen={isConfirmationModalOpen}
                    onClose={handleCloseModal}
                    invitation={selectedInvitation}
                    allInvitations={invitations}
                    onSuccess={handleConfirmationSuccess}
                />
            )}
        </>
    );
}