"use client";

import { memo, type ReactNode } from "react";

interface AnimatedEntityNameProps {
    name: ReactNode;
    isLoading?: boolean;
}

export const AnimatedEntityName = memo(function AnimatedEntityName({ name, isLoading = false }: AnimatedEntityNameProps) {
    if (isLoading) {
        return <div className="h-8 w-32 sm:w-40 bg-muted/50 rounded-lg animate-pulse" />;
    }

    return <h1 className="entity-header">{name}</h1>;
});

