"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminInput } from "@/components/admin/ui";

export function ProductSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(value.trim() ? `/admin/products?q=${encodeURIComponent(value.trim())}` : "/admin/products");
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search name, color, fabric, keyword…"
        className={adminInput}
      />
    </form>
  );
}
