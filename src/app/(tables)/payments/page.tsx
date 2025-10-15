import { ENTITY_DATA } from "../../../../config/entities";
import LabelTag from "../../../components/tags/LabelTag";

export default function PaymentsPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "Payment")!;
    const borderColor = entity.color.replace("text-", "border-");

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />
        </div>
    );
}
