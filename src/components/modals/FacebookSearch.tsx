"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSearch } from "@/src/providers/search-provider";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import type { TeacherModel } from "@/backend/models";
import { Search, User } from "lucide-react";
import { FacebookSearchHeader } from "./facebook-search-header"; // Import new header component

// Mock data for demonstration when hooks fail or return no data
const mockTeachers: TeacherModel[] = [
  { schema: { id: "1", firstName: "John", lastName: "Doe", username: "johndoe", email: "john@example.com" } } as TeacherModel,
  { schema: { id: "2", firstName: "Jane", lastName: "Smith", username: "janesmith", email: "jane@example.com" } } as TeacherModel,
  { schema: { id: "3", firstName: "Peter", lastName: "Jones", username: "peterjones", email: "peter@example.com" } } as TeacherModel,
];

// List Item Component
function FacebookListItem({ teacher, isActive }: { teacher: TeacherModel, isActive: boolean }) {
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (isActive && ref.current) {
            ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [isActive]);

    return (
        <li
            ref={ref}
            className={`flex items-center gap-4 px-4 py-3 transition-colors duration-150 rounded-lg cursor-pointer ${isActive ? 'bg-accent' : 'hover:bg-accent'}`}
        >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                    {teacher.schema.firstName} {teacher.schema.lastName}
                </p>
                <p className="text-xs text-muted-foreground">@{teacher.schema.username}</p>
            </div>
        </li>
    );
}

// List Component
function FacebookList({ teachers, activeIndex }: { teachers: TeacherModel[], activeIndex: number }) {
    if (teachers.length === 0) {
        return <div className="text-center py-12 text-sm text-muted-foreground">No teachers found.</div>;
    }
    return (
        <ul className="space-y-1">
            {teachers.map((teacher, index) => (
                <FacebookListItem
                    key={teacher.schema.id}
                    teacher={teacher}
                    isActive={index === activeIndex}
                />
            ))}
        </ul>
    );
}

// Main Modal Component
export default function FacebookSearch() {
    const { isOpen, onClose } = useSearch();
    const { teachers: allTeachers, loading } = useSchoolTeachers();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTeachers, setFilteredTeachers] = useState<TeacherModel[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1); // Initialize to -1 (no selection)

    // Keyboard navigation effect
    useEffect(() => {
        if (!isOpen || filteredTeachers.length === 0) return; // Only enable navigation if open AND has results

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) => (prev === filteredTeachers.length - 1 ? 0 : prev + 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) => (prev === 0 || prev === -1 ? filteredTeachers.length - 1 : prev - 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                let selectedTeacher: TeacherModel | undefined;

                if (filteredTeachers.length === 1) {
                    selectedTeacher = filteredTeachers[0];
                } else if (activeIndex !== -1) { // Only select if an item is actively highlighted
                    selectedTeacher = filteredTeachers[activeIndex];
                }
                
                if (selectedTeacher) {
                    console.log("Selected teacher:", selectedTeacher);
                    onClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [isOpen, filteredTeachers, activeIndex, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            setActiveIndex(-1); // Reset index to -1 on close
        }
        // If results are available when opening, set active to 0
        if (isOpen && filteredTeachers.length > 0) {
            setActiveIndex(0);
        }
    }, [isOpen, filteredTeachers.length]); // Added filteredTeachers.length to dependency to react to changes when modal is already open

    useEffect(() => {
        const teachersToFilter = allTeachers.length > 0 ? allTeachers : mockTeachers;
        
        if (searchTerm.trim() === "") {
            setFilteredTeachers(teachersToFilter);
            setActiveIndex(teachersToFilter.length > 0 ? 0 : -1); // Set active to 0 if results, else -1
            return;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const results = teachersToFilter.filter(
            (teacher) =>
                teacher.schema.firstName?.toLowerCase().includes(lowercasedTerm) ||
                teacher.schema.lastName?.toLowerCase().includes(lowercasedTerm) ||
                teacher.schema.username.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredTeachers(results);
        setActiveIndex(results.length > 0 ? 0 : -1); // Set active to 0 if results, else -1

    }, [searchTerm, allTeachers]);


    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal Panel */}
                <div className="fixed inset-0 overflow-y-auto p-4 pt-[15vh]">
                    <div className="flex items-start justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform rounded-xl bg-card shadow-2xl transition-all">
                                {/* New Header Component */}
                                <FacebookSearchHeader onClose={onClose} />

                                {/* Search Input (moved from previous position) */}
                                <div className="relative p-4"> {/* Added padding here */}
                                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search for teachers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-12 pr-4 bg-muted rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" // Adjusted styles
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="border-t border-border p-2 max-h-[400px] overflow-y-auto">
                                    {loading ? (
                                       <div className="text-center py-12 text-sm text-muted-foreground">Loading...</div>
                                    ) : (
                                       <FacebookList teachers={filteredTeachers} activeIndex={activeIndex} />
                                    )}
                                </div>
                                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                                    Use <kbd className="font-mono bg-muted p-1 rounded">↑</kbd> and <kbd className="font-mono bg-muted p-1 rounded">↓</kbd> to navigate, <kbd className="font-mono bg-muted p-1 rounded">Enter</kbd> to select.
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
