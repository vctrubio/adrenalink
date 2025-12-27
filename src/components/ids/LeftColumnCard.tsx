"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";
import { Card } from "@/src/components/ui/card";
import { CardList } from "@/src/components/ui/card/card-list";

interface LeftColumnCardProps {
  name: string;
  status: ReactNode;
  avatar: ReactNode;
  fields: { label: string; value: string | ReactNode }[];
  accentColor: string;
  isEditable?: boolean;
  isAddable?: boolean;
  onEdit?: () => void;
  onAdd?: () => void;
}

export function LeftColumnCard({ name, status, avatar, fields, accentColor, isEditable = false, isAddable = false, onEdit, onAdd }: LeftColumnCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full text-left outline-none cursor-pointer"
    >
      <Card accentColor={accentColor}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-6 flex-1">
            {avatar}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-foreground">{name}</h3>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{status}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditable && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
                style={{ color: accentColor, borderColor: accentColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${accentColor}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Edit
              </div>
            )}
            {isAddable && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
                style={{ color: accentColor, borderColor: accentColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${accentColor}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Add
              </div>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0, scale: 1 }}
              whileHover={{ rotate: isOpen ? 200 : -20, scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="origin-center"
              style={{ color: accentColor }}
            >
              <AdranlinkIcon size={20} />
            </motion.div>
          </div>
        </div>
        <div className="h-1 w-full rounded-full my-4" style={{ backgroundColor: accentColor }} />

        {isOpen && (
          <div className="px-2">
            <CardList fields={fields} />
          </div>
        )}
      </Card>
    </button>
  );
}
