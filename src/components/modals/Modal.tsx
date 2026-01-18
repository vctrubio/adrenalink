"use client";

import { Fragment, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: ReactNode;
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
    entityId?: string;
    icon?: ReactNode;
    iconColor?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = "2xl",
    entityId,
    icon,
    iconColor,
}: ModalProps) {
    const entity = entityId ? ENTITY_DATA.find((e) => e.id === entityId) : null;
    const EntityIcon = entity?.icon;
    const color = iconColor || entity?.color || "#6366f1";

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

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[9999]">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="popup-backdrop" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-150"
                        enterFrom="opacity-0 scale-98"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-98"
                    >
                        <Dialog.Panel className={`w-full ${maxWidthClass} outline-none`}>
                            <div className="relative flex flex-col max-h-[90vh] bg-card/98 backdrop-blur-sm rounded-2xl border border-border shadow-xl overflow-hidden">
                                {/* Header */}
                                {(title || EntityIcon || icon) && (
                                    <div className="px-8 py-6 border-b border-border/50 bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            {(icon || EntityIcon) && (
                                                <div style={{ color }}>
                                                    {icon || (EntityIcon && <EntityIcon size={28} />)}
                                                </div>
                                            )}
                                            {title && (
                                                <h2 className="text-xl font-semibold text-foreground">
                                                    {title}
                                                </h2>
                                            )}
                                        </div>
                                        {subtitle && <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {children}
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
