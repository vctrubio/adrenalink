import { ReactNode } from "react";

interface CardBodyProps {
    children?: ReactNode;
    sections?: Array<{
        label: string;
        value: string;
    }>;
}

export const CardBody = ({ children, sections }: CardBodyProps) => {
    if (sections) {
        return (
            <div className="space-y-3">
                {sections.map((section, index) => (
                    <div key={index} className="py-3 border-b border-white/10 last:border-0">
                        <div className="text-xs uppercase tracking-wider text-white/60 mb-2">{section.label}</div>
                        <p className="text-sm leading-relaxed">{section.value}</p>
                    </div>
                ))}
            </div>
        );
    }

    return <div className="space-y-3">{children}</div>;
};
