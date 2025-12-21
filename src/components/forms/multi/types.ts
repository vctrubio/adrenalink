import { UseFormReturn, FieldValues } from "react-hook-form";

export interface FormStep<T extends FieldValues = FieldValues> {
    id: number;
    title: string;
    icon?: React.ReactNode;
    fields?: (keyof T)[];
}

export interface BaseStepProps<T extends FieldValues = FieldValues> {
    formMethods: UseFormReturn<T>;
    onGoToStep?: (stepIndex: number) => void;
}

export interface SummaryField {
    key: string;
    label: string;
    displayValue?: string;
    editable?: boolean;
    colSpan?: 1 | 2;
}