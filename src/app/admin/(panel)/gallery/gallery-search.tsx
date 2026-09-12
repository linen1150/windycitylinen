"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminInput } from "@/components/admin/ui";

export function GallerySearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(value.trim() ? `/admin/gallery?q=${encodeURIComponent(value.trim())}` : "/admin/gallery");
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search captions…"
        className={adminInput}
      />
    </form>
  );
}
