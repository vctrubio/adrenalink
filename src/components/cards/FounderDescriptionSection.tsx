interface DescriptionSection {
    title: string;
    content: string;
}

interface FounderDescriptionSectionProps {
    sections: DescriptionSection[];
}

export const FounderDescriptionSection = ({ sections }: FounderDescriptionSectionProps) => {
    return (
        <div className="space-y-6">
            {sections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-700">{section.content}</p>
                </div>
            ))}
        </div>
    );
};
