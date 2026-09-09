"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page");
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 border border-line px-4 py-3">
      <Search size={16} className="text-ink-soft" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Try "108 round ivory" or "rustic runner"'
        className="flex-1 bg-transparent text-sm outline-none"
        aria-label="Search the catalog"
      />
      <button type="submit" className="bg-ink px-4 py-1.5 text-[13px] text-[#EDE7D8]">
        Search
      </button>
    </form>
  );
}
