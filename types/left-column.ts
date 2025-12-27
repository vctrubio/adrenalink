import type { ReactNode } from "react";

export interface LeftColumnCardData {
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
