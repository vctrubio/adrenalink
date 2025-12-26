"use client";

import { Fragment, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
    entityId?: string;
    subtitle?: string;
    entityIconColor?: string;
    equipmentIcon?: React.ComponentType<any>;
    equipmentIconColor?: string;
    equipmentName?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "2xl", entityId, subtitle, equipmentIcon: EquipmentIcon, equipmentIconColor, equipmentName, entityIconColor }: ModalProps) {
    const { ENTITY_DATA } = require("@/config/entities");
    const entity = entityId ? ENTITY_DATA.find((e: any) => e.id === entityId) : null;
    const Icon = entity?.icon;
    const color = entityIconColor || entity?.color || "#6366f1";

    const maxWidthClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
    }[maxWidth];

    const hasHeader = title || entityId;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`w-full ${maxWidthClass} transform overflow-hidden rounded-lg bg-card border border-border text-left align-middle shadow-xl transition-all`}
                            >
                                {/* Header with LeftColumnCard-style layout */}
                                {hasHeader && (
                                    <div className="flex items-center justify-between gap-6 px-8 py-6 border-b border-border">
                                        {/* Entity Icon (Avatar style - Teacher) */}
                                        <div className="flex-shrink-0">
                                            {Icon && (
                                                <div style={{ color }}>
                                                    <Icon className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Title and Equipment Info */}
                                        <div className="flex-1 min-w-0">
                                            <Dialog.Title as="h3" className="text-xl font-bold text-foreground">
                                                {title}
                                            </Dialog.Title>
                                            {equipmentName && EquipmentIcon && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <EquipmentIcon size={14} style={{ color: equipmentIconColor }} />
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        {equipmentName}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Close Button */}
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded flex-shrink-0"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                <div className="p-6">{children}</div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
