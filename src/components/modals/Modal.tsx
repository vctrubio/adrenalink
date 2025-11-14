"use client";

import { Fragment, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "2xl" }: ModalProps) {
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
                                <div className="flex items-center justify-between p-6 border-b border-border">
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-foreground">
                                        {title}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6">{children}</div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
