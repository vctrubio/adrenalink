"use client";

import { Fragment, useMemo, useState, useCallback, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ENTITY_DATA } from "@/config/entities";
import { useRouter, usePathname } from "next/navigation";
import { WizardTable, type WizardColumn } from "@/src/components/ui/wizzard/WizardTable";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { getWizardEntities, type WizardEntity } from "@/supabase/server/wizard-entities";
import { PopUpRows } from "@/src/components/ui/popup/PopUpRows";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { KeyboardHint } from "@/src/components/ui/popup/KeyboardHint";
import React from "react";

interface NavigationWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TARGET_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export function NavigationWizardModal({ isOpen, onClose }: NavigationWizardModalProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);
    const [subItems, setSubItems] = useState<WizardEntity[]>([]);
    const [isLoadingSubList, setIsLoadingSubList] = useState(false);

    const allEntities = useMemo(() => TARGET_ENTITIES.map((id) => ENTITY_DATA.find((e) => e.id === id)).filter((e): e is (typeof ENTITY_DATA)[number] => !!e), []);

    const expandedEntityName = useMemo(() => allEntities.find((e) => e.id === expandedEntityId)?.name, [expandedEntityId, allEntities]);

    // Reset state when closing
    const handleClose = useCallback(() => {
        setExpandedEntityId(null);
        setSubItems([]);
        onClose();
    }, [onClose]);

    // MAIN NAVIGATION
    const mainNav = useModalNavigation({
        items: allEntities,
        filterField: (item) => `${item.name} ${item.description.join(" ")}`,
        isOpen,
        isActive: !expandedEntityId,
        onSelect: (item) => {
            handleClose();
            router.push(item.link);
        },
    });

    // SUB NAVIGATION
    const subNav = useModalNavigation({
        items: subItems,
        filterField: "title",
        isOpen,
        isActive: !!expandedEntityId,
        onSelect: (item) => {
            handleClose();
            const routeMap: Record<string, string> = {
                schoolPackage: "packages",
            };
            const route = routeMap[expandedEntityId || ""] || `${expandedEntityId}s`;
            router.push(`/${route}/${item.id}`);
        },
    });

    // Fetch sub-list data
    useEffect(() => {
        if (expandedEntityId) {
            setIsLoadingSubList(true);
            getWizardEntities(expandedEntityId)
                .then((data) => {
                    setSubItems(data);
                    setIsLoadingSubList(false);
                })
                .catch(() => {
                    setSubItems([]);
                    setIsLoadingSubList(false);
                });
        } else {
            setSubItems([]);
        }
    }, [expandedEntityId]);

    // Handle Tab / Shift+Tab and Implicit Search logic
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                e.preventDefault();
                if (expandedEntityId) {
                    if (e.shiftKey) {
                        setExpandedEntityId(null);
                        mainNav.setSearchQuery("");
                    }
                } else {
                    if (e.shiftKey) {
                        handleClose();
                    } else if (mainNav.selectedItem) {
                        setExpandedEntityId(mainNav.selectedItem.id);
                    }
                }
                return;
            }

            if (!expandedEntityId && e.key.length === 1 && /[a-z]/i.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
                if (document.activeElement?.tagName === "INPUT") return;

                const key = e.key.toLowerCase();
                const map: Record<string, string> = {
                    s: "student",
                    t: "teacher",
                    p: "schoolPackage",
                    b: "booking",
                    e: "equipment",
                };

                if (map[key]) {
                    const index = allEntities.findIndex((entity) => entity.id === map[key]);
                    if (index !== -1) {
                        mainNav.setFocusedIndex(index);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, expandedEntityId, mainNav.selectedItem, mainNav.setFocusedIndex, mainNav.setSearchQuery, allEntities, handleClose]);

    // Initial sync
    useEffect(() => {
        if (isOpen && !expandedEntityId) {
            const currentIndex = allEntities.findIndex((e) => pathname.startsWith(e.link));
            if (currentIndex !== -1) {
                mainNav.setFocusedIndex(currentIndex);
            }
        }
    }, [isOpen, pathname, allEntities, mainNav.setFocusedIndex, expandedEntityId]);

    const columns: WizardColumn<(typeof ENTITY_DATA)[number]>[] = [
        {
            id: "icon",
            header: "",
            width: "60px",
            align: "center",
            cell: (entity) => {
                const Icon = entity.icon;
                return (
                    <div className="p-2 rounded-lg bg-muted/20" style={{ color: entity.color }}>
                        <Icon className="w-6 h-6" />
                    </div>
                );
            },
        },
        {
            id: "name",
            header: "",
            width: "1fr",
            cell: (entity) => (
                <div className="flex flex-col">
                    <span className="font-bold text-lg popup-text-primary">{entity.name}</span>
                    <span className="text-xs popup-text-tertiary">{entity.description[0]}</span>
                </div>
            ),
        },
        {
            id: "action",
            header: "",
            width: "40px",
            align: "center",
            cell: (entity) => (
                <ToggleAdranalinkIcon
                    isOpen={false}
                    onClick={(e) => {
                        e?.stopPropagation();
                        setExpandedEntityId(entity.id);
                    }}
                    className="text-primary dark:text-secondary"
                />
            ),
        },
    ];

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleClose} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                        <Dialog.Panel className="w-full max-w-2xl outline-none">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative flex flex-col max-h-[85vh] bg-background/95 backdrop-blur-xl rounded-3xl border border-border/40 p-6 shadow-2xl">
                                {/* Dynamic Header */}
                                <div className="mb-6 flex flex-col items-center">
                                    <AnimatePresence mode="wait">
                                        {!expandedEntityId ? (
                                            <motion.div key="header-main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex items-center gap-4">
                                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }} className="shrink-0 dark:invert">
                                                    <Image src="/ADR.webp" alt="Adrenalink" width={64} height={64} className="drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                                                </motion.div>
                                                <div className="flex flex-col">
                                                    <motion.h2 initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }} className="text-3xl font-black tracking-tighter text-foreground leading-none">
                                                        Adrenalink
                                                    </motion.h2>
                                                    <p className="text-muted-foreground/60 text-sm font-bold uppercase tracking-widest">Navigate your way</p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="header-sub"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex flex-col items-center cursor-pointer group gap-2"
                                                onClick={() => setExpandedEntityId(null)}
                                            >
                                                <motion.div initial={{ rotate: 0 }} animate={{ rotate: -90 }} transition={{ duration: 0.4, ease: "backOut" }} className="dark:invert opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Image src="/ADR.webp" alt="Adrenalink" width={40} height={40} />
                                                </motion.div>
                                                <h2 className="text-4xl font-black tracking-tight text-foreground">{expandedEntityName}</h2>
                                                <p className="text-muted-foreground/60 text-sm font-bold uppercase tracking-widest">Select an item</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!expandedEntityId ? (
                                        <motion.div key="main-list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col flex-1 min-h-0">
                                            <PopUpSearch value={mainNav.searchQuery} onChange={mainNav.setSearchQuery} className="mb-4" placeholder="Search categories..." />
                                            <div className="flex-1 min-h-0">
                                                <WizardTable
                                                    data={mainNav.filteredItems}
                                                    columns={columns}
                                                    onRowClick={(item) => {
                                                        handleClose();
                                                        router.push(item.link);
                                                    }}
                                                    getRowId={(e) => e.id}
                                                    getRowAccentColor={(e) => e.color}
                                                    selectedId={mainNav.selectedItem?.id}
                                                    hideHeader={true}
                                                    className="max-h-[50vh] border-none bg-transparent backdrop-blur-none shadow-none"
                                                />
                                            </div>
                                            {mainNav.selectedItem && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                                                    <KeyboardHint keys="TAB" action={`to browse ${mainNav.selectedItem.name}`} />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div key="sub-list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex flex-col flex-1 min-h-0">
                                            <PopUpSearch value={subNav.searchQuery} onChange={subNav.setSearchQuery} className="mb-4" />
                                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar max-h-[50vh]">
                                                {isLoadingSubList ? (
                                                    <div className="popup-loading h-32">
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    </div>
                                                ) : (
                                                    <PopUpRows
                                                        items={subNav.filteredItems.map((item) => ({
                                                            id: item.id,
                                                            title: item.title,
                                                            subtitle: item.subtitle,
                                                            isActive: item.status === "Active",
                                                        }))}
                                                        selectedId={subNav.selectedItem?.id}
                                                        onSelect={(item) => {
                                                            handleClose();
                                                            const routeMap: Record<string, string> = {
                                                                schoolPackage: "packages",
                                                            };
                                                            const route = routeMap[expandedEntityId || ""] || `${expandedEntityId}s`;
                                                            router.push(`/${route}/${item.id}`);
                                                        }}
                                                        renderItem={(item, isSelected) => (
                                                            <div className="flex items-center justify-between px-4 py-3 gap-4">
                                                                <div className="flex flex-col">
                                                                    <span className={`font-bold transition-colors ${isSelected ? "text-primary dark:text-secondary" : "text-foreground"}`}>{item.title}</span>
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{item.subtitle}</span>
                                                                </div>
                                                                <div className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${item.isActive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted/30 text-muted-foreground"}`}>
                                                                    {item.isActive ? "Active" : "Inactive"}
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                                                <KeyboardHint keys={["Shift", "TAB"]} action="to go back" />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Keyboard Status Bar Footer */}
                                <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-border/20">
                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Go-To</span>
                                        <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">ENTER</span>
                                    </div>
                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Submit</span>
                                        <div className="flex gap-1">
                                            <span className="bg-background px-1 py-0.5 rounded shadow-sm text-foreground font-black text-[9px]">⇧</span>
                                            <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">ENTER</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                        <AnimatePresence mode="wait">
                                            {!expandedEntityId ? (
                                                <motion.div key="hint-browse" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center justify-between w-full">
                                                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest truncate mr-2">Browse</span>
                                                    <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">TAB</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="hint-toggle-disabled" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center justify-between w-full opacity-30">
                                                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Browse</span>
                                                    <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">TAB</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                        <AnimatePresence mode="wait">
                                            {expandedEntityId ? (
                                                <motion.div key="hint-reset" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center justify-between w-full">
                                                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Back</span>
                                                    <div className="flex gap-1">
                                                        <span className="bg-background px-1 py-0.5 rounded shadow-sm text-foreground font-black text-[9px]">⇧</span>
                                                        <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">TAB</span>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="hint-reset-disabled" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center justify-between w-full opacity-30">
                                                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Back</span>
                                                    <div className="flex gap-1">
                                                        <span className="bg-background px-1 py-0.5 rounded shadow-sm text-foreground font-black text-[9px]">⇧</span>
                                                        <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">TAB</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Close</span>
                                        <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">ESC</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
