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
            <Dialog onClose={onClose} className="relative z-50">
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
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel className={`w-full ${maxWidthClass} outline-none`}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="relative flex flex-col max-h-[85vh]"
                            >
                                {/* Header */}
                                {(title || EntityIcon || icon) && (
                                    <div className="mb-6 flex flex-col items-center text-center">
                                        <div className="flex items-center gap-4 mb-2">
                                            {(icon || EntityIcon) && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
                                                    style={{ color }}
                                                >
                                                    {icon || (EntityIcon && <EntityIcon size={32} />)}
                                                </motion.div>
                                            )}
                                            {title && (
                                                <motion.h2
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                                                    className="text-2xl popup-header-title"
                                                >
                                                    {title}
                                                </motion.h2>
                                            )}
                                        </div>
                                        {subtitle && <div className="popup-header-subtitle">{subtitle}</div>}
                                    </div>
                                )}

                                {/* Content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                                    className="flex-1 min-h-0"
                                >
                                    {children}
                                </motion.div>

                                {/* Footer Hint */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-4 text-center"
                                >
                                    <div className="popup-hint-container bg-transparent">
                                        <span className="popup-hint-key">ESC</span>
                                        <span>to close</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
