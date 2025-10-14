"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormSubmit } from "@/src/components/ui/form";
import { CountryFlagPhoneSubForm } from "./CountryFlagPhoneSubForm";
import { createStudent } from "@/actions/students-action";
import { usePhoneClear } from "@/src/hooks/usePhoneClear";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  passport: z.string().min(1, "Passport is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
});

type StudentFormData = z.infer<typeof studentSchema>;

export function WelcomeStudentForm() {
  const methods = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      passport: "",
      country: "",
      phone: "",
    },
  });

  const { register, formState: { errors }, setValue, watch } = methods;
  const countryValue = watch("country");
  const phoneValue = watch("phone");
  const { clearPhone, triggerPhoneClear } = usePhoneClear();

  const onSubmit = async (data: StudentFormData) => {
    try {
      await createStudent(data);
      methods.reset();
      triggerPhoneClear();
      // Add success notification here if needed
    } catch (error) {
      console.error("Error creating student:", error);
      // Add error notification here if needed
    }
  };

  return (
    <Form methods={methods} onSubmit={onSubmit} className="bg-card border-border rounded-lg shadow-sm">
      <div className="space-y-6">
        <FormField label="Full Name" required error={errors.name?.message}>
          <FormInput
            {...register("name")}
            placeholder="Enter student's full name"
            error={!!errors.name}
          />
        </FormField>

        <FormField label="Passport Number" required error={errors.passport?.message}>
          <FormInput
            {...register("passport")}
            placeholder="Enter passport number"
            error={!!errors.passport}
          />
        </FormField>

        <div>
          <CountryFlagPhoneSubForm
            onCountryChange={(country) => setValue("country", country)}
            onPhoneChange={(phone) => setValue("phone", phone)}
            countryValue={countryValue}
            phoneValue={phoneValue}
            countryError={errors.country?.message}
            phoneError={errors.phone?.message}
            onClearPhone={clearPhone}
          />
        </div>

        <FormSubmit color="#eab308">
          Create Student
        </FormSubmit>
      </div>
    </Form>
  );
}