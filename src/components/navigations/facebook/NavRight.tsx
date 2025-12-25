"use client";
import { Plus, Search, Sun, Moon } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { useTheme } from "next-themes";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSearch } from "@/src/providers/search-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import FacebookSearch from "@/src/components/modals/FacebookSearch";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Student4SchoolForm from "@/src/components/forms/school/Student4SchoolForm";
import TeacherForm from "@/src/components/forms/school/Teacher4SchoolForm";
import Package4SchoolForm from "@/src/components/forms/school/Package4SchoolForm";
import Equipment4SchoolForm from "@/src/components/forms/school/Equipment4SchoolForm";
import { studentFormSchema, defaultStudentForm, teacherFormSchema, defaultTeacherForm, packageFormSchema, defaultPackageForm, equipmentFormSchema, defaultEquipmentForm, type StudentFormData, type TeacherFormData, type PackageFormData, type EquipmentFormData } from "@/types/form-entities";
import { createAndLinkStudent, createAndLinkTeacher, createSchoolPackage, createSchoolEquipment } from "@/actions/register-action";

const CREATE_ENTITIES = ["student", "teacher", "schoolPackage", "equipment"];

const ActionButton = ({ icon: Icon, children, onClick, buttonRef }: { icon?: React.ElementType; children?: React.ReactNode; onClick?: () => void; buttonRef?: React.RefObject<HTMLButtonElement> }) => (
    <button ref={buttonRef} onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent">
        {Icon && <Icon className="h-5 w-5" />}
        {children}
    </button>
);

export const NavRight = () => {
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [selectedCreateEntity, setSelectedCreateEntity] = useState<"student" | "teacher" | "schoolPackage" | "equipment" | null>(null);
    const [studentFormData, setStudentFormData] = useState<StudentFormData>(defaultStudentForm);
    const [teacherFormData, setTeacherFormData] = useState<TeacherFormData>(defaultTeacherForm);
    const [packageFormData, setPackageFormData] = useState<PackageFormData>(defaultPackageForm);
    const [equipmentFormData, setEquipmentFormData] = useState<EquipmentFormData>(defaultEquipmentForm);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { onOpen } = useSearch();
    const credentials = useSchoolCredentials();

    const createButtonRef = useRef<HTMLButtonElement>(null);
    const adminButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

    // Form validity checks
    const isStudentFormValid = useMemo(() => studentFormSchema.safeParse(studentFormData).success, [studentFormData]);
    const isTeacherFormValid = useMemo(() => teacherFormSchema.safeParse(teacherFormData).success, [teacherFormData]);
    const isPackageFormValid = useMemo(() => packageFormSchema.safeParse(packageFormData).success, [packageFormData]);
    const isEquipmentFormValid = useMemo(() => equipmentFormSchema.safeParse(equipmentFormData).success, [equipmentFormData]);

    // Submit handlers
    const handleStudentSubmit = useCallback(async () => {
        try {
            await createAndLinkStudent({
                firstName: studentFormData.firstName,
                lastName: studentFormData.lastName,
                passport: studentFormData.passport,
                country: studentFormData.country,
                phone: studentFormData.phone,
                languages: studentFormData.languages,
            }, studentFormData.canRent, studentFormData.description || undefined);
            setStudentFormData(defaultStudentForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Student creation error:", error);
        }
    }, [studentFormData]);

    const handleTeacherSubmit = useCallback(async () => {
        try {
            await createAndLinkTeacher(
                {
                    firstName: teacherFormData.firstName,
                    lastName: teacherFormData.lastName,
                    username: teacherFormData.username,
                    passport: teacherFormData.passport,
                    country: teacherFormData.country,
                    phone: teacherFormData.phone,
                    languages: teacherFormData.languages,
                },
                teacherFormData.commissions.map(c => ({
                    commissionType: c.commissionType,
                    commissionValue: c.commissionValue,
                    commissionDescription: c.commissionDescription,
                }))
            );
            setTeacherFormData(defaultTeacherForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Teacher creation error:", error);
        }
    }, [teacherFormData]);

    const handlePackageSubmit = useCallback(async () => {
        try {
            await createSchoolPackage({
                durationMinutes: packageFormData.durationMinutes,
                description: packageFormData.description,
                pricePerStudent: packageFormData.pricePerStudent,
                capacityStudents: packageFormData.capacityStudents,
                capacityEquipment: packageFormData.capacityEquipment,
                categoryEquipment: packageFormData.categoryEquipment,
                packageType: packageFormData.packageType,
                isPublic: packageFormData.isPublic,
            });
            setPackageFormData(defaultPackageForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Package creation error:", error);
        }
    }, [packageFormData]);

    const handleEquipmentSubmit = useCallback(async () => {
        try {
            await createSchoolEquipment({
                category: equipmentFormData.category,
                sku: equipmentFormData.sku,
                model: equipmentFormData.model,
                color: equipmentFormData.color || undefined,
                size: equipmentFormData.size || undefined,
                status: equipmentFormData.status || undefined,
            });
            setEquipmentFormData(defaultEquipmentForm);
            setSelectedCreateEntity(null);
        } catch (error) {
            console.error("Equipment creation error:", error);
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
                label: `Owner ID: ${credentials.ownerId}`,
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
                <div className="relative">
                    <ActionButton buttonRef={createButtonRef} icon={Plus} onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)} />
                    <Dropdown 
                        isOpen={isCreateDropdownOpen} 
                        onClose={() => setIsCreateDropdownOpen(false)} 
                        items={createDropdownItems} 
                        align="right"
                        triggerRef={createButtonRef}
                    />
                </div>
                <ActionButton icon={Search} onClick={onOpen} />
                <ActionButton onClick={() => setTheme(isDarkMode ? "light" : "dark")} icon={isDarkMode ? Sun : Moon} />
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
            <FacebookSearch />

            <EntityAddDialog
                isOpen={selectedCreateEntity === "student"}
                onClose={() => setSelectedCreateEntity(null)}
            >
                <Student4SchoolForm
                    formData={studentFormData}
                    onFormDataChange={setStudentFormData}
                    isFormReady={isStudentFormValid}
                    onSubmit={handleStudentSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>

            <EntityAddDialog
                isOpen={selectedCreateEntity === "teacher"}
                onClose={() => setSelectedCreateEntity(null)}
            >
                <TeacherForm
                    formData={teacherFormData}
                    onFormDataChange={setTeacherFormData}
                    isFormReady={isTeacherFormValid}
                    onSubmit={handleTeacherSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>

            <EntityAddDialog
                isOpen={selectedCreateEntity === "schoolPackage"}
                onClose={() => setSelectedCreateEntity(null)}
            >
                <Package4SchoolForm
                    formData={packageFormData}
                    onFormDataChange={setPackageFormData}
                    isFormReady={isPackageFormValid}
                    onSubmit={handlePackageSubmit}
                    isLoading={isLoadingSubmit}
                    onClose={() => setSelectedCreateEntity(null)}
                />
            </EntityAddDialog>

            <EntityAddDialog
                isOpen={selectedCreateEntity === "equipment"}
                onClose={() => setSelectedCreateEntity(null)}
            >
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