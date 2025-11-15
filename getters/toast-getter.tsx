import { toast } from "sonner";
import { ENTITY_DATA } from "@/config/entities";

export interface ToastOptions {
    title?: string;
    description?: string;
    duration?: number;
}

/**
 * Show a toast notification with entity branding (icon, color, etc)
 */
export function showEntityToast(entityId: string, options: ToastOptions = {}) {
    const entity = ENTITY_DATA.find((e) => e.id === entityId);

    if (!entity) {
        console.warn(`Entity ${entityId} not found in ENTITY_DATA`);
        return;
    }

    const IconComponent = entity.icon;
    const { title = `New ${entity.name}`, description = "", duration = 4000 } = options;

    toast.custom(
        (toastId) => (
            <div
                className="flex items-center gap-3 rounded-lg border p-4 bg-background shadow-lg"
                style={{
                    borderColor: entity.color,
                    borderWidth: "2px",
                }}
            >
                <IconComponent
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: entity.color }}
                />
                <div className="flex-1">
                    <div className="font-semibold text-foreground">{title}</div>
                    {description && (
                        <div className="text-sm text-muted-foreground mt-1">{description}</div>
                    )}
                </div>
            </div>
        ),
        {
            duration,
        }
    );
}
