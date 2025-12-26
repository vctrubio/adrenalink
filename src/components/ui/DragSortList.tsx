"use client";

import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";

export interface DragSortItem {
  id: string;
  [key: string]: any;
}

interface DragSortListProps<T extends DragSortItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  className?: string;
}

export function DragSortList<T extends DragSortItem>({
  items,
  onReorder,
  renderItem,
  className = "",
}: DragSortListProps<T>) {
  const [sortedItems, setSortedItems] = useState<T[]>(items);

  useEffect(() => {
    setSortedItems(items);
  }, [items]);

  const handleReorder = (newOrder: T[]) => {
    setSortedItems(newOrder);
    onReorder(newOrder);
  };

  return (
    <Reorder.Group
      axis="y"
      values={sortedItems}
      onReorder={handleReorder}
      className={className}
    >
      {sortedItems.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="cursor-grab active:cursor-grabbing"
        >
          {renderItem(item, false)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
