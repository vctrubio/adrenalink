"use client";
import { Plus } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { useTheme } from "next-themes";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { TeacherSortPriorityManModal } from "@/src/components/modals/admin";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Student4SchoolForm from "@/src/components/forms/school/Student4SchoolForm";
import TeacherForm from "@/src/components/forms/school/Teacher4SchoolForm";
import Package4SchoolForm from "@/src/components/forms/school/Package4SchoolForm";
import Equipment4SchoolForm from "@/src/components/forms/school/Equipment4SchoolForm";
import { studentCreateSchema, defaultStudentForm, StudentCreateForm } from "@/src/validation/student";
import { teacherCreateSchema, defaultTeacherForm, TeacherCreateForm } from "@/src/validation/teacher";
import { schoolPackageCreateSchema, defaultPackageForm, SchoolPackageCreateForm } from "@/src/validation/school-package";
import { equipmentCreateSchema, defaultEquipmentForm, EquipmentCreateForm } from "@/src/validation/equipment";
import { createAndLinkStudent, createAndLinkTeacher, createSchoolPackage, createSchoolEquipment } from "@/supabase/server/register";

const CREATE_ENTITIES = ["student", "teacher", "schoolPackage", "equipment"];

const NoWindIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path
            fill="currentColor"
            d="M16.64,13.634C16.993,13.874,17.411,14,17.85,14c0.753,0,1.461-0.395,1.846-1.029    c0.308-0.503,0.383-1.107,0.208-1.657c-0.178-0.556-0.596-1.01-1.148-1.244l-3.811-1.62c-0.158-0.848-0.675-1.564-1.385-2    l0.422-4.243C13.997,2.124,14,2.042,14,1.96C14,0.879,13.103,0,12,0c-0.572,0-1.118,0.241-1.497,0.662    c-0.369,0.409-0.548,0.956-0.491,1.498l0.428,4.29c-0.71,0.436-1.227,1.152-1.385,2l-3.811,1.62    c-0.552,0.234-0.97,0.688-1.148,1.244c-0.176,0.55-0.101,1.154,0.207,1.656C4.689,13.605,5.396,14,6.15,14    c0.439,0,0.857-0.126,1.211-0.366l3.069-2.089c0.12,0.074,0.243,0.146,0.373,0.203L9.006,23.424    c-0.022,0.144,0.02,0.291,0.115,0.402C9.215,23.937,9.354,24,9.5,24h5c0.146,0,0.285-0.063,0.379-0.174    c0.095-0.111,0.137-0.258,0.115-0.402l-1.798-11.676c0.131-0.057,0.253-0.128,0.373-0.203L16.64,13.634z M10,9c0-1.103,0.897-2,2-2    s2,0.897,2,2s-0.897,2-2,2S10,10.103,10,9z M18.951,11.619c0.089,0.277,0.05,0.572-0.108,0.832c-0.324,0.536-1.14,0.697-1.642,0.356    l-2.864-1.949c0.302-0.379,0.518-0.826,0.608-1.321l3.419,1.453C18.652,11.112,18.861,11.335,18.951,11.619z M11.007,2.058    c-0.028-0.267,0.057-0.525,0.24-0.727C11.436,1.121,11.71,1,12,1c0.551,0,1,0.431,1,0.96l-0.407,4.1C12.401,6.021,12.203,6,12,6    c-0.203,0-0.401,0.021-0.593,0.06L11.007,2.058z M6.8,12.806c-0.503,0.342-1.316,0.18-1.644-0.357    c-0.158-0.258-0.196-0.553-0.107-0.83c0.09-0.283,0.299-0.506,0.587-0.629l3.419-1.453c0.09,0.495,0.307,0.942,0.608,1.321    L6.8,12.806z M13.917,23h-3.834l1.697-11.022C11.854,11.983,11.925,12,12,12s0.146-0.017,0.22-0.022L13.917,23z"
        />
        <circle cx="12" cy="9" r="1" fill="currentColor" />
    </svg>
);

const WindIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path
            fill="currentColor"
            d="M16.64,13.634C16.993,13.874,17.411,14,17.85,14c0.753,0,1.461-0.395,1.846-1.029    c0.308-0.503,0.383-1.107,0.208-1.657c-0.178-0.556-0.596-1.01-1.148-1.244l-3.811-1.62c-0.158-0.848-0.675-1.564-1.385-2    l0.422-4.243C13.997,2.124,14,2.042,14,1.96C14,0.879,13.103,0,12,0c-0.572,0-1.118,0.241-1.497,0.662    c-0.369,0.409-0.548,0.956-0.491,1.498l0.428,4.29c-0.71,0.436-1.227,1.152-1.385,2l-3.811,1.62    c-0.552,0.234-0.97,0.688-1.148,1.244c-0.176,0.55-0.101,1.154,0.207,1.656C4.689,13.605,5.396,14,6.15,14    c0.439,0,0.857-0.126,1.211-0.366l3.069-2.089c0.12,0.074,0.243,0.146,0.373,0.203L9.006,23.424    c-0.022,0.144,0.02,0.291,0.115,0.402C9.215,23.937,9.354,24,9.5,24h5c0.146,0,0.285-0.063,0.379-0.174    c0.095-0.111,0.137-0.258,0.115-0.402l-1.798-11.676c0.131-0.057,0.253-0.128,0.373-0.203L16.64,13.634z M10,9c0-1.103,0.897-2,2-2    s2,0.897,2,2s-0.897,2-2,2S10,10.103,10,9z M18.951,11.619c0.089,0.277,0.05,0.572-0.108,0.832    c-0.325,0.536-1.139,0.697-1.642,0.356l-2.864-1.949c0.302-0.379,0.518-0.826,0.608-1.321l3.419,1.453    C18.652,11.112,18.861,11.335,18.951,11.619z M11.007,2.058c-0.028-0.267,0.057-0.525,0.24-0.727C11.436,1.121,11.71,1,12,1    c0.551,0,1,0.431,1,0.96l-0.407,4.1C12.401,6.021,12.203,6,12,6c-0.203,0-0.401,0.021-0.593,0.06L11.007,2.058z M6.8,12.806    c-0.504,0.342-1.317,0.18-1.644-0.357c-0.158-0.258-0.196-0.553-0.107-0.83c0.09-0.283,0.299-0.506,0.587-0.629l3.419-1.453    c0.09,0.495,0.307,0.942,0.608,1.321L6.8,12.806z M13.917,23h-3.834l1.697-11.022C11.854,11.983,11.925,12,12,12    s0.146-0.017,0.22-0.022L13.917,23z"
        />
        <path
            fill="currentColor"
            d="M15.421,2.892c-0.242-0.137-0.546-0.051-0.681,0.19c-0.136,0.241-0.051,0.545,0.19,0.681    c0.145,0.082,0.287,0.169,0.423,0.261c0.16,0.108,0.314,0.223,0.463,0.346c0.148,0.123,0.291,0.252,0.426,0.388    s0.265,0.278,0.388,0.426c0.123,0.148,0.238,0.303,0.345,0.462c0.108,0.16,0.208,0.324,0.3,0.495    c0.092,0.17,0.177,0.344,0.253,0.523c0.076,0.18,0.143,0.364,0.202,0.551c0.058,0.188,0.107,0.379,0.147,0.576    c0.036,0.174,0.064,0.351,0.084,0.53c0.029,0.255,0.246,0.444,0.497,0.444c0.019,0,0.038-0.001,0.057-0.003    c0.274-0.031,0.472-0.279,0.441-0.553c-0.024-0.209-0.057-0.416-0.099-0.618c-0.046-0.228-0.104-0.452-0.172-0.672    c-0.068-0.219-0.147-0.434-0.235-0.643c-0.088-0.209-0.187-0.414-0.295-0.612c-0.108-0.199-0.225-0.392-0.351-0.579    c-0.126-0.186-0.26-0.365-0.403-0.538c-0.142-0.172-0.293-0.338-0.451-0.497s-0.324-0.309-0.497-0.451    c-0.173-0.143-0.352-0.277-0.539-0.404C15.754,3.088,15.59,2.986,15.421,2.892z"
        />
        <path
            fill="currentColor"
            d="M6.599,4.547C6.456,4.72,6.322,4.899,6.195,5.086C6.07,5.272,5.953,5.465,5.845,5.663    S5.639,6.066,5.55,6.275C5.462,6.484,5.383,6.699,5.314,6.919c-0.068,0.22-0.126,0.444-0.172,0.67    C5.096,7.817,5.06,8.049,5.036,8.286C5.009,8.56,5.209,8.805,5.484,8.833C5.5,8.834,5.518,8.835,5.534,8.835    c0.254,0,0.471-0.192,0.497-0.45c0.02-0.201,0.051-0.4,0.091-0.596c0.04-0.195,0.089-0.387,0.147-0.574    c0.059-0.188,0.126-0.372,0.202-0.552C6.547,6.485,6.632,6.311,6.724,6.14s0.192-0.335,0.3-0.494    c0.108-0.16,0.223-0.314,0.346-0.463c0.123-0.148,0.252-0.291,0.388-0.426S8.036,4.492,8.184,4.37    c0.148-0.123,0.303-0.238,0.462-0.345c0.16-0.108,0.324-0.208,0.495-0.3c0.243-0.131,0.333-0.435,0.201-0.678    C9.21,2.803,8.906,2.713,8.664,2.845C8.465,2.953,8.272,3.07,8.085,3.196C7.899,3.322,7.72,3.456,7.547,3.599    C7.375,3.741,7.208,3.892,7.05,4.05S6.741,4.375,6.599,4.547z"
        />
    </svg>
);

const ActionButton = ({
    icon: Icon,
    children,
    onClick,
    buttonRef,
}: {
    icon?: React.ElementType;
    children?: React.ReactNode;
    onClick?: () => void;
    buttonRef?: React.RefObject<HTMLButtonElement>;
}) => (
    <button
        ref={buttonRef}
        onClick={onClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
    >
        {Icon && <Icon className="h-5 w-5" />}
        {children}
    </button>
);

export const NavRight = () => {
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [isTeacherSortModalOpen, setIsTeacherSortModalOpen] = useState(false);
    const [selectedCreateEntity, setSelectedCreateEntity] = useState<"student" | "teacher" | "schoolPackage" | "equipment" | null>(
        null,
    );
    const [studentFormData, setStudentFormData] = useState<StudentCreateForm>(defaultStudentForm);
    const [teacherFormData, setTeacherFormData] = useState<TeacherCreateForm>(defaultTeacherForm);
    const [packageFormData, setPackageFormData] = useState<SchoolPackageCreateForm>(defaultPackageForm);
    const [equipmentFormData, setEquipmentFormData] = useState<EquipmentCreateForm>(defaultEquipmentForm);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const credentials = useSchoolCredentials();

    const createButtonRef = useRef<HTMLButtonElement>(null);
    const adminButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Note: Cmd+J handler moved to NavLeft
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsTeacherSortModalOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const isDarkMode = resolvedTheme === "dark";

    // Form validity checks
    const isStudentFormValid = useMemo(() => studentCreateSchema.safeParse(studentFormData).success, [studentFormData]);
    const isTeacherFormValid = useMemo(() => teacherCreateSchema.safeParse(teacherFormData).success, [teacherFormData]);
    const isPackageFormValid = useMemo(() => schoolPackageCreateSchema.safeParse(packageFormData).success, [packageFormData]);
    const isEquipmentFormValid = useMemo(() => equipmentCreateSchema.safeParse(equipmentFormData).success, [equipmentFormData]);

    // Submit handlers
    const handleStudentSubmit = useCallback(async () => {
        setIsLoadingSubmit(true);
        try {
            await createAndLinkStudent(
                {
                    first_name: studentFormData.first_name,
                    last_name: studentFormData.last_name,
                    passport: studentFormData.passport,
                    country: studentFormData.country,
                    phone: studentFormData.phone,
                    languages: studentFormData.languages,
                },
                studentFormData.rental,
                studentFormData.description || undefined,
            );
            setStudentFormData(defaultStudentForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Student creation error:", error);
        } finally {
            setIsLoadingSubmit(false);
        }
    }, [studentFormData]);

    const handleTeacherSubmit = useCallback(async () => {
        setIsLoadingSubmit(true);
        try {
            await createAndLinkTeacher(
                {
                    first_name: teacherFormData.first_name,
                    last_name: teacherFormData.last_name,
                    username: teacherFormData.username,
                    passport: teacherFormData.passport,
                    country: teacherFormData.country,
                    phone: teacherFormData.phone,
                    languages: teacherFormData.languages,
                },
                teacherFormData.commissions.map((c) => ({
                    commission_type: c.commission_type,
                    cph: c.cph.toString(),
                    description: c.description || undefined,
                })),
            );
            setTeacherFormData(defaultTeacherForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Teacher creation error:", error);
        } finally {
            setIsLoadingSubmit(false);
        }
    }, [teacherFormData]);

    const handlePackageSubmit = useCallback(async () => {
        setIsLoadingSubmit(true);
        try {
            await createSchoolPackage({
                duration_minutes: packageFormData.duration_minutes,
                description: packageFormData.description,
                price_per_student: packageFormData.price_per_student,
                capacity_students: packageFormData.capacity_students,
                capacity_equipment: packageFormData.capacity_equipment,
                category_equipment: packageFormData.category_equipment,
                package_type: packageFormData.package_type,
                is_public: packageFormData.is_public,
            });
            setPackageFormData(defaultPackageForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Package creation error:", error);
        } finally {
            setIsLoadingSubmit(false);
        }
    }, [packageFormData]);

    const handleEquipmentSubmit = useCallback(async () => {
        setIsLoadingSubmit(true);
        try {
            await createSchoolEquipment({
                category: equipmentFormData.category,
                sku: equipmentFormData.sku,
                brand: equipmentFormData.brand,
                model: equipmentFormData.model,
                color: equipmentFormData.color || undefined,
                size: equipmentFormData.size || undefined,
                status: equipmentFormData.status || undefined,
            });
            setEquipmentFormData(defaultEquipmentForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Equipment creation error:", error);
        } finally {
            setIsLoadingSubmit(false);
        }
    }, [equipmentFormData]);

    const createEntities = ENTITY_DATA.filter((entity) => CREATE_ENTITIES.includes(entity.id));
    const createDropdownItems: DropdownItemProps[] = createEntities.map((entity) => ({
        id: entity.id,
        label: entity.name,
        icon: entity.icon,
        color: entity.color,
        onClick: () => {
            setSelectedCreateEntity(entity.id as "student" | "teacher" | "schoolPackage" | "equipment");
            setIsCreateDropdownOpen(false);
        },
    }));

    const adminDropdownItems: DropdownItemProps[] = credentials
        ? [
            {
                id: "username",
                label: `Username: ${credentials.username}`,
            },
            {
                id: "currency",
                label: `Currency: ${credentials.currency}`,
            },
            {
                id: "status",
                label: `Status: ${credentials.status}`,
            },
            {
                id: "ownerId",
                label: `Clerk ID: ${credentials.clerkId}`,
            },
        ]
        : [];

    const renderCredentialItem = (item: DropdownItemProps) => {
        const [key, value] = item.label?.split(": ") || [];
        return (
            <div className="px-4 py-2 text-sm">
                <div className="text-xs text-muted-foreground font-medium">{key}</div>
                <div className="text-foreground font-semibold truncate">{value}</div>
            </div>
        );
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <ActionButton icon={HeadsetIcon} onClick={() => setIsTeacherSortModalOpen(true)} />
                <div className="relative">
                    <ActionButton
                        buttonRef={createButtonRef}
                        icon={Plus}
                        onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                    />
                    <Dropdown
                        isOpen={isCreateDropdownOpen}
                        onClose={() => setIsCreateDropdownOpen(false)}
                        items={createDropdownItems}
                        align="right"
                        triggerRef={createButtonRef}
                    />
                </div>
                <button
                    onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
                    title={isMounted ? (isDarkMode ? "Switch to Light mode" : "Switch to Dark mode") : "Toggle theme"}
                >
                    {isMounted ? (
                        isDarkMode ? <WindIcon className="h-5 w-5" /> : <NoWindIcon className="h-5 w-5" />
                    ) : (
                        <NoWindIcon className="h-5 w-5" />
                    )}
                </button>
                <div className="relative">
                    <ActionButton buttonRef={adminButtonRef} onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}>
                        <AdminIcon className="h-6 w-6" />
                    </ActionButton>
                    <Dropdown
                        isOpen={isAdminDropdownOpen}
                        onClose={() => setIsAdminDropdownOpen(false)}
                        items={adminDropdownItems}
                        renderItem={renderCredentialItem}
                        align="right"
                        triggerRef={adminButtonRef}
                    />
                </div>
            </div>
            <TeacherSortPriorityManModal isOpen={isTeacherSortModalOpen} onClose={() => setIsTeacherSortModalOpen(false)} />

            <EntityAddDialog isOpen={selectedCreateEntity === "student"} onClose={() => setSelectedCreateEntity(null)}>
                <Student4SchoolForm
                    formData={studentFormData}
                    onFormDataChange={setStudentFormData}
                    isFormReady={isStudentFormValid}
                    onSubmit={handleStudentSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>

            <EntityAddDialog isOpen={selectedCreateEntity === "teacher"} onClose={() => setSelectedCreateEntity(null)}>
                <TeacherForm
                    formData={teacherFormData}
                    onFormDataChange={setTeacherFormData}
                    isFormReady={isTeacherFormValid}
                    onSubmit={handleTeacherSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>

            <EntityAddDialog isOpen={selectedCreateEntity === "schoolPackage"} onClose={() => setSelectedCreateEntity(null)}>
                <Package4SchoolForm
                    formData={packageFormData}
                    onFormDataChange={setPackageFormData}
                    isFormReady={isPackageFormValid}
                    onSubmit={handlePackageSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>

            <EntityAddDialog isOpen={selectedCreateEntity === "equipment"} onClose={() => setSelectedCreateEntity(null)}>
                <Equipment4SchoolForm
                    formData={equipmentFormData}
                    onFormDataChange={setEquipmentFormData}
                    isFormReady={isEquipmentFormValid}
                    onSubmit={handleEquipmentSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>
        </>
    );
};
