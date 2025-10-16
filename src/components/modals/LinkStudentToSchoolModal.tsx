"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { getAvailableSchoolsForStudent, linkStudentToSchool } from "../../../actions/students-action";
import { getSchoolName } from "../../../getters/schools-getter";

interface LinkStudentToSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    onSuccess: () => void;
}

export default function LinkStudentToSchoolModal({ isOpen, onClose, studentId, onSuccess }: LinkStudentToSchoolModalProps) {
    const [schools, setSchools] = useState<any[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAvailableSchools();
        }
    }, [isOpen, studentId]);

    const fetchAvailableSchools = async () => {
        setLoading(true);
        try {
            const result = await getAvailableSchoolsForStudent(studentId);
            if (result.success) {
                setSchools(result.data);
            }
        } catch (error) {
            console.error("Error fetching available schools:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchoolId) return;

        setSubmitting(true);
        try {
            const result = await linkStudentToSchool(studentId, selectedSchoolId, description);
            if (result.success) {
                onSuccess();
                onClose();
                setSelectedSchoolId("");
                setDescription("");
            }
        } catch (error) {
            console.error("Error linking student to school:", error);
        } finally {
            setSubmitting(false);
        }
    };

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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-foreground mb-4">
                                    Link Student to School
                                </Dialog.Title>

                                {loading ? (
                                    <p className="text-muted-foreground">Loading available schools...</p>
                                ) : schools.length === 0 ? (
                                    <p className="text-muted-foreground">No available schools to link this student to.</p>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Select School
                                            </label>
                                            <select
                                                value={selectedSchoolId}
                                                onChange={(e) => setSelectedSchoolId(e.target.value)}
                                                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                                                required
                                            >
                                                <option value="">Select a school...</option>
                                                {schools.map((school) => (
                                                    <option key={school.id} value={school.id}>
                                                        {getSchoolName(school)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Description (optional)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                                                rows={3}
                                                placeholder="Add a description for this relationship..."
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!selectedSchoolId || submitting}
                                                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                {submitting ? "Linking..." : "Link to School"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}