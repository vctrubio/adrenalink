"use client";

import { ReactNode, useEffect, useRef } from "react";
import { FormProvider, UseFormReturn, FieldValues } from "react-hook-form";

interface FormProps<T extends FieldValues = FieldValues> {
  children: ReactNode;
  methods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function Form<T extends FieldValues = FieldValues>({
  children,
  methods,
  onSubmit,
  isOpen = true,
  onClose,
  className = "",
}: FormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
      if (event.key === "Enter" && event.target !== document.body) {
        event.preventDefault();
        methods.handleSubmit(onSubmit)();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, methods, onSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={methods.handleSubmit(onSubmit)}
        className={`border space-y-8 p-8 ${className}`}
      >
        <div ref={firstInputRef}>{children}</div>
      </form>
    </FormProvider>
  );
}
