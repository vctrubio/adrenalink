"use client";

import { useState } from "react";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";

interface TeacherBatchUpdateDropdownProps {
  eventIds: string[];
  onClose: () => void;
  onUpdated?: () => void;
}

export default function TeacherBatchUpdateDropdown({ eventIds, onClose, onUpdated }: TeacherBatchUpdateDropdownProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Mark all as completed
  const handleMarkAllCompleted = async () => {
    setLoading(true);
    setError(null);
    try {
      // This assumes you want to update status to COMPLETED for all events
      // You may want to expand this for more batch actions
      // Here, we just call the bulk update with no changes (as a placeholder)
      const updates = eventIds.map(id => ({ id, date: new Date().toISOString(), duration: 0 }));
      await bulkUpdateClassboardEvents(updates);
      if (onUpdated) onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to update events");
    } finally {
      setLoading(false);
    }
  };

  // Example: Delete all events
  const handleDeleteAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await bulkUpdateClassboardEvents([], eventIds);
      if (onUpdated) onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to delete events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow p-3 min-w-[200px] z-50">
      <div className="font-semibold mb-2 text-sm">Batch Actions</div>
      <button
        className="w-full text-left py-1 px-2 rounded hover:bg-muted/30 text-sm disabled:opacity-60"
        onClick={handleMarkAllCompleted}
        disabled={loading}
      >
        Mark all as completed
      </button>
      <button
        className="w-full text-left py-1 px-2 rounded hover:bg-muted/30 text-sm disabled:opacity-60"
        onClick={handleDeleteAll}
        disabled={loading}
      >
        Delete all events
      </button>
      <button
        className="w-full text-left py-1 px-2 rounded hover:bg-muted/30 text-sm mt-2"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
    </div>
  );
}
