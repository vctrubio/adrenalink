import { UseFormReturn } from "react-hook-form";

export type FormStep = {
    id: number;
    title: string;
    icon?: React.ReactNode;
    fields?: string[];
};

export interface BaseStepProps<T = any> {
    formMethods: UseFormReturn<T>;
    onGoToStep?: (stepIndex: number) => void;
}

export interface SummaryField {
    key: string;
    label: string;
    value?: any;
    displayValue?: string;
    editable?: boolean;
    colSpan?: 1 | 2;
}

export interface MultiFormConfig<T = any> {
    steps: FormStep[];
    stepComponents: Record<number, React.ComponentType<any>>;
    stepProps: Record<number, any>;
    title?: string;
    subtitle?: string;
    submitButtonText?: string;
    submitButtonColor?: string;
}