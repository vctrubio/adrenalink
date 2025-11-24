"use client";

import { useRouter } from "next/navigation";

interface TransactionRowProps {
  eventId: string;
  date: string;
  time: string;
  duration: string;
  teacher: string;
  statusColor: string;
  statusLabel: string;
  equipment: string;
  students: string;
  revenue: string;
  commission: string;
  leftover: string;
}

export default function TransactionRow({
  eventId,
  date,
  time,
  duration,
  teacher,
  statusColor,
  statusLabel,
  equipment,
  students,
  revenue,
  commission,
  leftover,
}: TransactionRowProps) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/events/${eventId}`)}
      className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
    >
      <td className="px-4 py-3 text-sm font-medium">{date}</td>
      <td className="px-4 py-3 text-sm font-mono">{time}</td>
      <td className="px-4 py-3 text-sm">{duration}</td>
      <td className="px-4 py-3 text-sm font-medium">{teacher}</td>
      <td className="px-4 py-3">
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">{equipment}</td>
      <td className="px-4 py-3 text-sm">{students}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold">${revenue}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold">${commission}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold">${leftover}</td>
    </tr>
  );
}
