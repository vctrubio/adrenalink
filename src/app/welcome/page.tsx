"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormInput, FormSelect, FormButton } from "../../components/ui/form";

const DEFAULT_COUNTRY = "ES";

const COUNTRIES = [
  { code: "ES", name: "Spain", prefix: "+34" },
  { code: "US", name: "United States", prefix: "+1" },
  { code: "UK", name: "United Kingdom", prefix: "+44" },
  { code: "FR", name: "France", prefix: "+33" },
  { code: "DE", name: "Germany", prefix: "+49" },
  { code: "IT", name: "Italy", prefix: "+39" },
  { code: "PT", name: "Portugal", prefix: "+351" },
];

const welcomeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  fullName: z.string().min(5, "Full name must be at least 5 characters"),
  country: z.string().min(2, "Please select a country"),
  phoneNumber: z.string().min(9, "Phone number must be at least 9 digits"),
});

type WelcomeFormData = z.infer<typeof welcomeSchema>;

export default function WelcomePage() {
  const methods = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      firstName: "",
      fullName: "",
      country: DEFAULT_COUNTRY,
      phoneNumber: "",
    },
  });

  const selectedCountry = COUNTRIES.find(c => c.code === methods.watch("country"));

  const onSubmit = (data: WelcomeFormData) => {
    const phoneWithPrefix = `${selectedCountry?.prefix}${data.phoneNumber}`;
    console.log("Form submitted:", { ...data, phoneWithPrefix });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Welcome to Adrenalink</h1>
          <p className="mt-2 text-muted-foreground">Let&apos;s get you started</p>
        </div>

        <Form methods={methods} onSubmit={onSubmit} className="bg-card rounded-lg border border-border">
          <FormField label="First Name" required error={methods.formState.errors.firstName?.message}>
            <FormInput
              {...methods.register("firstName")}
              placeholder="Your first name"
              autoFocus
            />
          </FormField>

          <FormField label="Full Name" required error={methods.formState.errors.fullName?.message}>
            <FormInput
              {...methods.register("fullName")}
              placeholder="Your full name"
            />
          </FormField>

          <FormField label="Country" required error={methods.formState.errors.country?.message}>
            <FormSelect
              {...methods.register("country")}
              options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
            />
          </FormField>

          <FormField
            label={`Phone Number ${selectedCountry?.prefix || ""}`}
            required
            error={methods.formState.errors.phoneNumber?.message}
          >
            <FormInput
              {...methods.register("phoneNumber")}
              placeholder="123456789"
              type="tel"
            />
          </FormField>

          <FormButton type="submit" variant="primary" className="w-full">
            Get Started
          </FormButton>
        </Form>
      </div>
    </div>
  );
}
