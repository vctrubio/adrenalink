"use client";

import { useRouter } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";

type FormType = "booking" | "student" | "package" | "teacher";

interface FormSelectorProps {
    activeForm: FormType;
}

const formConfig = [
    { id: "booking", name: "Booking", entity: ENTITY_DATA.find(e => e.id === "booking")! },
    { id: "student", name: "Student", entity: ENTITY_DATA.find(e => e.id === "student")! },
    { id: "package", name: "Package", entity: ENTITY_DATA.find(e => e.id === "schoolPackage")! },
    { id: "teacher", name: "Teacher", entity: ENTITY_DATA.find(e => e.id === "teacher")! },
];

export function FormSelector({ activeForm }: FormSelectorProps) {
    const router = useRouter();

    return (
        <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Check in</h3>
            <div className="grid grid-cols-2 gap-2">
                {formConfig.map((form) => {
                    const Icon = form.entity.icon;
                    const isActive = activeForm === form.id;

                    const handleClick = () => {
                        if (form.id === "student") {
                            router.push("/register/student");
                        } else if (form.id === "package") {
                            router.push("/register/package");
                        } else if (form.id === "teacher") {
                            router.push("/register/teacher");
                        } else {
                            router.push("/register");
                        }
                    };

                    return (
                        <button
                            key={form.id}
                            onClick={handleClick}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                isActive
                                    ? "border-primary"
                                    : "border-border bg-background hover:border-primary/50"
                            }`}
                            style={{
                                borderColor: isActive ? form.entity.color : undefined,
                                backgroundColor: isActive ? `${form.entity.color}15` : undefined,
                            }}
                        >
                            <div
                                className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                                style={{ color: form.entity.color }}
                            >
                                <Icon className="w-full h-full" fill={form.entity.color} />
                            </div>
                            <span className="text-sm font-medium">{form.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
