"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormSelect, FormSubmit } from "@/src/components/ui/form";
import { createPackage } from "@/actions/packages-action";
import { EQUIPMENT_CATEGORIES } from "@/config/categories";

const schoolPackageSchema = z.object({
    durationMinutes: z.number().min(1, "Duration is required"),
    description: z.string().optional(),
    pricePerStudent: z.number().min(1, "Price per student is required"),
    capacityStudents: z.number().min(1, "Student capacity is required"),
    capacityEquipment: z.number().min(1, "Equipment capacity is required"),
    categoryEquipment: z.enum(["kite", "wing", "windsurf", "surf", "snowboard"]),
    schoolId: z.string().min(1, "School is required"),
    isPublic: z.boolean(),
    active: z.boolean(),
});

type SchoolPackageFormData = z.infer<typeof schoolPackageSchema>;

interface SchoolPackageFormProps {
    schoolId?: string;
    onSuccess?: () => void;
}

export function SchoolPackageForm({ schoolId, onSuccess }: SchoolPackageFormProps) {
    const methods = useForm<SchoolPackageFormData>({
        resolver: zodResolver(schoolPackageSchema),
        defaultValues: {
            durationMinutes: 60,
            description: "",
            pricePerStudent: 0,
            capacityStudents: 1,
            capacityEquipment: 1,
            categoryEquipment: "kite",
            schoolId: schoolId || "",
            isPublic: true,
            active: true,
        },
    });

    const {
        register,
        formState: { errors },
        watch,
    } = methods;

    const durationValue = watch("durationMinutes");
    const priceValue = watch("pricePerStudent");
    const capacityStudentsValue = watch("capacityStudents");
    const capacityEquipmentValue = watch("capacityEquipment");
    const categoryValue = watch("categoryEquipment");

    const onSubmit = async (data: SchoolPackageFormData) => {
        try {
            await createPackage(data);
            methods.reset();
            onSuccess?.();
        } catch (error) {
            console.error("Error creating package:", error);
        }
    };

    return (
        <Form methods={methods} onSubmit={onSubmit} className="bg-card border-border rounded-lg shadow-sm">
            <div className="space-y-6">
                <FormField label="Duration (minutes)" required error={errors.durationMinutes?.message} isValid={!errors.durationMinutes && durationValue > 0}>
                    <FormInput 
                        {...register("durationMinutes", { valueAsNumber: true })} 
                        type="number" 
                        placeholder="Enter duration in minutes" 
                        error={!!errors.durationMinutes} 
                    />
                </FormField>

                <FormField label="Description" error={errors.description?.message}>
                    <FormInput {...register("description")} placeholder="Enter package description" error={!!errors.description} />
                </FormField>

                <FormField label="Price per Student" required error={errors.pricePerStudent?.message} isValid={!errors.pricePerStudent && priceValue > 0}>
                    <FormInput 
                        {...register("pricePerStudent", { valueAsNumber: true })} 
                        type="number" 
                        placeholder="Enter price per student" 
                        error={!!errors.pricePerStudent} 
                    />
                </FormField>

                <FormField label="Student Capacity" required error={errors.capacityStudents?.message} isValid={!errors.capacityStudents && capacityStudentsValue > 0}>
                    <FormInput 
                        {...register("capacityStudents", { valueAsNumber: true })} 
                        type="number" 
                        placeholder="Enter student capacity" 
                        error={!!errors.capacityStudents} 
                    />
                </FormField>

                <FormField label="Equipment Capacity" required error={errors.capacityEquipment?.message} isValid={!errors.capacityEquipment && capacityEquipmentValue > 0}>
                    <FormInput 
                        {...register("capacityEquipment", { valueAsNumber: true })} 
                        type="number" 
                        placeholder="Enter equipment capacity" 
                        error={!!errors.capacityEquipment} 
                    />
                </FormField>

                <FormField label="Equipment Category" required error={errors.categoryEquipment?.message} isValid={!errors.categoryEquipment && !!categoryValue}>
                    <FormSelect 
                        {...register("categoryEquipment")} 
                        error={!!errors.categoryEquipment}
                        options={EQUIPMENT_CATEGORIES.map(category => ({
                            value: category.id,
                            label: category.name
                        }))}
                    />
                </FormField>

                <FormSubmit color="#10b981">Create Package</FormSubmit>
            </div>
        </Form>
    );
}