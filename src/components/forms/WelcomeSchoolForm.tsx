"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormSubmit } from "@/src/components/ui/form";
import { CountryFlagPhoneSubForm } from "./CountryFlagPhoneSubForm";
import { createSchool } from "@/actions/schools-action";
import { usePhoneClear } from "@/src/hooks/usePhoneClear";

const schoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export function WelcomeSchoolForm() {
  const methods = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      country: "",
      phone: "",
    },
  });

  const { register, formState: { errors }, setValue, watch } = methods;
  const countryValue = watch("country");
  const phoneValue = watch("phone");
  const { clearPhone, triggerPhoneClear } = usePhoneClear();

  const onSubmit = async (data: SchoolFormData) => {
    try {
      await createSchool(data);
      methods.reset();
      triggerPhoneClear();
      // Add success notification here if needed
    } catch (error) {
      console.error("Error creating school:", error);
      // Add error notification here if needed
    }
  };

  return (
    <Form methods={methods} onSubmit={onSubmit} className="bg-card border-border rounded-lg shadow-sm">
      <div className="space-y-6">
        <FormField label="School Name" required error={errors.name?.message}>
          <FormInput
            {...register("name")}
            placeholder="Enter school name"
            error={!!errors.name}
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

        <FormSubmit color="#6366f1">
          Create School
        </FormSubmit>
      </div>
    </Form>
  );
}