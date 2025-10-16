"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { getAvailableStudentsForSchool } from "../../../actions/schools-action";
import { linkStudentToSchool } from "../../../actions/students-action";
import { getStudentName } from "../../../getters/students-getter";

export default function LinkSchoolToStudentModal({ isOpen, onClose, schoolId, onSuccess }: { isOpen: boolean; onClose: () => void; schoolId: string; onSuccess: () => void }) {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAvailableStudents();
        }
    }, [isOpen, schoolId]);

    const fetchAvailableStudents = async () => {
        setLoading(true);
        try {
            const result = await getAvailableStudentsForSchool(schoolId);
            if (result.success) {
                setStudents(result.data);
            }
        } catch (error) {
            console.error("Error fetching available students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        setSubmitting(true);
        try {
            const result = await linkStudentToSchool(selectedStudentId, schoolId, description);
            if (result.success) {
                onSuccess();
                onClose();
                setSelectedStudentId("");
                setDescription("");
            }
        } catch (error) {
            console.error("Error linking school to student:", error);
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
                                    Link School to Student
                                </Dialog.Title>

                                {loading ? (
                                    <p className="text-muted-foreground">Loading available students...</p>
                                ) : students.length === 0 ? (
                                    <p className="text-muted-foreground">No available students to link this school to.</p>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Select Student
                                            </label>
                                            <select
                                                value={selectedStudentId}
                                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                                                required
                                            >
                                                <option value="">Select a student...</option>
                                                {students.map((student) => (
                                                    <option key={student.id} value={student.id}>
                                                        {getStudentName(student)}
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
                                                disabled={!selectedStudentId || submitting}
                                                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                {submitting ? "Linking..." : "Link to Student"}
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