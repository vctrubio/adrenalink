import Link from "next/link";
import { ReactNode } from "react";

interface ButtonConfig {
    label: string | ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "tertiary";
}

interface RowBtnProps {
    buttons: ButtonConfig[];
}

export const RowBtn = ({ buttons }: RowBtnProps) => {
    const getButtonStyles = (variant: ButtonConfig["variant"] = "secondary") => {
        const baseStyles = "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center";
        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            tertiary: "bg-accent text-accent-foreground hover:bg-accent/80",
        };
        return `${baseStyles} ${variants[variant]}`;
    };

    return (
        <div className="flex items-center gap-2">
            {buttons.map((button, index) => {
                if (button.href) {
                    return (
                        <Link key={index} href={button.href} className={getButtonStyles(button.variant)}>
                            {button.label}
                        </Link>
                    );
                }
                return (
                    <button key={index} onClick={button.onClick} className={getButtonStyles(button.variant)}>
                        {button.label}
                    </button>
                );
            })}
        </div>
    );
};
