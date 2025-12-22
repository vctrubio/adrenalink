"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "./Modal";
import Form from "@/src/components/ui/form/form";
import FormField from "@/src/components/ui/form/form-field";
import FormInput from "@/src/components/ui/form/form-input";
import FormSubmit from "@/src/components/ui/form/form-submit";
import { createEquipmentRepair } from "@/actions/equipment-repair-action";


interface AddEquipmentRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  onRepairAdded: () => void;
}

const repairSchema = z.object({
  description: z.string().min(1, "Description is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
});

type RepairFormData = z.infer<typeof repairSchema>;

export default function AddEquipmentRepairModal({
  isOpen,
  onClose,
  equipmentId,
  onRepairAdded,
}: AddEquipmentRepairModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<RepairFormData>({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      description: "",
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: "",
      price: 0,
    },
  });

  const handleSubmit = async (data: RepairFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createEquipmentRepair(equipmentId, {
        description: data.description || null,
        checkIn: data.checkIn,
        checkOut: data.checkOut || null,
        price: data.price,
      });

      if (!result.success) {
        return;
      }



      onRepairAdded?.();
      onClose();
      methods.reset();
    } catch (error) {
      console.error("Error adding repair:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Equipment Repair" maxWidth="lg">
      <Form
        methods={methods}
        onSubmit={handleSubmit}
        isOpen={isOpen}
        onClose={onClose}
        className="space-y-4"
      >
        <FormField label="Description" error={methods.formState.errors.description?.message}>
          <FormInput
            {...methods.register("description")}
            placeholder="Describe the repair needed"
            autoFocus
          />
        </FormField>

        <FormField label="Check-In Date" error={methods.formState.errors.checkIn?.message}>
          <FormInput type="date" {...methods.register("checkIn")} />
        </FormField>

        <FormField label="Check-Out Date (Optional)" error={methods.formState.errors.checkOut?.message}>
          <FormInput type="date" {...methods.register("checkOut")} />
        </FormField>

        <FormField label="Repair Cost" error={methods.formState.errors.price?.message}>
          <FormInput
            type="number"
            {...methods.register("price")}
            placeholder="0"
            step="1"
            min="0"
          />
        </FormField>

        <FormSubmit disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Repair"}
        </FormSubmit>
      </Form>
    </Modal>
  );
}
