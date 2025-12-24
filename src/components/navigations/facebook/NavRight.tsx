"use client";
import { Plus, Search, Sun, Moon } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { useTheme } from "next-themes";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/src/providers/search-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import FacebookSearch from "@/src/components/modals/FacebookSearch";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, DropdownItem, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Student4SchoolForm, { type StudentFormData, studentFormSchema } from "@/src/components/forms/school/Student4SchoolForm";
import TeacherForm, { type TeacherFormData, teacherFormSchema } from "@/src/components/forms/school/Teacher4SchoolForm";
import Package4SchoolForm, { type PackageFormData, packageFormSchema } from "@/src/components/forms/school/Package4SchoolForm";
import { createAndLinkStudent, createAndLinkTeacher, createSchoolPackage } from "@/actions/register-action";
import toast from "react-hot-toast";

const CREATE_ENTITIES = ["student", "teacher", "schoolPackage", "equipment"];

const ActionButton = ({ icon: Icon, children, onClick }: { icon?: React.ElementType; children?: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent">
        {Icon && <Icon className="h-5 w-5" />}
        {children}
    </button>
);

export const NavRight = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [selectedCreateEntity, setSelectedCreateEntity] = useState<"student" | "teacher" | "schoolPackage" | null>(null);
    const [studentFormData, setStudentFormData] = useState<StudentFormData>({
        firstName: "",
        lastName: "",
        schoolGrade: "",
        motherTongue: [],
    });
    const [teacherFormData, setTeacherFormData] = useState<TeacherFormData>({
        firstName: "",
        lastName: "",
        username: "",
        passport: "",
        country: "",
        phone: "",
        languages: ["English"],
        commissions: [],
    });
    const [packageFormData, setPackageFormData] = useState<PackageFormData>({
        durationMinutes: 60,
        description: "",
        pricePerStudent: 0,
        capacityStudents: 1,
        capacityEquipment: 1,
        categoryEquipment: "" as any,
        packageType: "" as any,
        isPublic: true,
    });
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { onOpen } = useSearch();
    const credentials = useSchoolCredentials();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

    // Form validity checks
    const isStudentFormValid = useMemo(() => studentFormSchema.safeParse(studentFormData).success, [studentFormData]);
    const isTeacherFormValid = useMemo(() => teacherFormSchema.safeParse(teacherFormData).success, [teacherFormData]);
    const isPackageFormValid = useMemo(() => packageFormSchema.safeParse(packageFormData).success, [packageFormData]);

    // Submit handlers
    const handleStudentSubmit = useCallback(async () => {
        if (!isStudentFormValid) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsLoadingSubmit(true);
        try {
            const result = await createAndLinkStudent({
                firstName: studentFormData.firstName,
                lastName: studentFormData.lastName,
                schoolGrade: studentFormData.schoolGrade,
                motherTongue: studentFormData.motherTongue,
            });
            if (!result.success) {
                toast.error(result.error || "Failed to create student");
                setIsLoadingSubmit(false);
                return;
            }
            toast.success("Student created successfully");
            setSelectedCreateEntity(null);
            router.push(`/register?studentId=${result.data.id}`);
            setIsLoadingSubmit(false);
        } catch (error) {
            console.error("Student creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            setIsLoadingSubmit(false);
        }
    }, [isStudentFormValid, studentFormData, router]);

    const handleTeacherSubmit = useCallback(async () => {
        if (!isTeacherFormValid) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsLoadingSubmit(true);
        try {
            const result = await createAndLinkTeacher(
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
            if (!result.success) {
                toast.error(result.error || "Failed to create teacher");
                setIsLoadingSubmit(false);
                return;
            }
            toast.success("Teacher created successfully");
            setSelectedCreateEntity(null);
            router.push(`/register?add=teacher:${result.data.teacher.id}`);
            setIsLoadingSubmit(false);
        } catch (error) {
            console.error("Teacher creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            setIsLoadingSubmit(false);
        }
    }, [isTeacherFormValid, teacherFormData, router]);

    const handlePackageSubmit = useCallback(async () => {
        if (!isPackageFormValid) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsLoadingSubmit(true);
        try {
            const result = await createSchoolPackage({
                durationMinutes: packageFormData.durationMinutes,
                description: packageFormData.description,
                pricePerStudent: packageFormData.pricePerStudent,
                capacityStudents: packageFormData.capacityStudents,
                capacityEquipment: packageFormData.capacityEquipment,
                categoryEquipment: packageFormData.categoryEquipment,
                packageType: packageFormData.packageType,
                isPublic: packageFormData.isPublic,
            });
            if (!result.success) {
                toast.error(result.error || "Failed to create package");
                setIsLoadingSubmit(false);
                return;
            }
            toast.success("Package created successfully");
            setSelectedCreateEntity(null);
            router.push(`/register?add=package:${result.data.id}`);
            setIsLoadingSubmit(false);
        } catch (error) {
            console.error("Package creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            setIsLoadingSubmit(false);
        }
    }, [isPackageFormValid, packageFormData, router]);

    const createEntities = ENTITY_DATA.filter((entity) => CREATE_ENTITIES.includes(entity.id));
    const createDropdownItems: DropdownItemProps[] = createEntities.map((entity) => ({
        id: entity.id,
        label: entity.name,
        href: entity.id === "equipment" ? entity.link : undefined,
        icon: entity.icon,
        color: entity.color,
        onClick: entity.id !== "equipment" ? () => {
            setSelectedCreateEntity(entity.id as "student" | "teacher" | "schoolPackage");
            setIsCreateDropdownOpen(false);
        } : undefined,
    }));

    const adminDropdownItems: DropdownItemProps[] = credentials
        ? [
            {
                id: "username",
                label: `Username: ${credentials.username}`,
                href: undefined,
            },
            {
                id: "currency",
                label: `Currency: ${credentials.currency}`,
                href: undefined,
            },
            {
                id: "status",
                label: `Status: ${credentials.status}`,
                href: undefined,
            },
            {
                id: "ownerId",
                label: `Owner ID: ${credentials.ownerId}`,
                href: undefined,
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
                    <ActionButton icon={Plus} onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)} />
                    <Dropdown isOpen={isCreateDropdownOpen} onClose={() => setIsCreateDropdownOpen(false)} items={createDropdownItems} align="right" />
                </div>
                <ActionButton icon={Search} onClick={onOpen} />
                <ActionButton onClick={() => setTheme(isDarkMode ? "light" : "dark")} icon={mounted ? (isDarkMode ? Sun : Moon) : undefined} />
                <div className="relative">
                    <ActionButton onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}>
                        <AdminIcon className="h-6 w-6" />
                    </ActionButton>
                    <Dropdown isOpen={isAdminDropdownOpen} onClose={() => setIsAdminDropdownOpen(false)} items={adminDropdownItems} renderItem={renderCredentialItem} align="right" />
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
                />
            </EntityAddDialog>
        </>
    );
};
