"use client";

import { Tag } from "@/src/components/ui/tag/tag";
import UrlIcon from "@/public/appSvgs/UrlIcon";

interface UrlParamAddTagProps {
    type: "student" | "teacher" | "package";
    id: string;
    color: string;
}

export const UrlParamAddTag = ({ type, id, color }: UrlParamAddTagProps) => {
    return (
        <Tag
            icon={<UrlIcon className="w-3 h-3" />}
            name="Add"
            bgColor="#e5e7eb"
            borderColorHex={color}
            color="#4b5563"
            link={`/register?add=${type}:${id}`}
        />
    );
};
