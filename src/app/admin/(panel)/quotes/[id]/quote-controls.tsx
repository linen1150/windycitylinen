"use client";

import { useTransition } from "react";
import { adminLabel } from "@/components/admin/ui";
import { setQuoteStatus, deleteQuote } from "@/lib/admin/quotes";

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "QUOTED", label: "Quoted" },
  { value: "CLOSED", label: "Closed" },
];

export function QuoteControls({
  id,
  status,
  name,
}: {
  id: string;
  status: string;
  name: string;
}) {
  const [pending, start] = useTransition();

  return (
    <div className={pending ? "opacity-50" : ""}>
      <span className={adminLabel}>Status</span>
      <select
        defaultValue={status}
        onChange={(e) => start(() => setQuoteStatus(id, e.target.value))}
        className="w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          if (confirm(`Delete the quote request from ${name}? This can't be undone.`)) {
            start(() => deleteQuote(id));
          }
        }}
        className="mt-4 text-xs text-wine hover:underline"
      >
        Delete this request
      </button>
    </div>
  );
}
