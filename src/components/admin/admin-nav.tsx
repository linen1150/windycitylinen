"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/taxonomy", label: "Categories & fabrics" },
  { href: "/admin/design-center", label: "Design Center" },
  { href: "/admin/hero", label: "Home hero" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/quotes", label: "Quote requests" },
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "mobile") {
    return (
      <nav className="flex gap-4 overflow-x-auto text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap ${isActive(l.href, l.exact) ? "font-medium text-ink" : "text-ink-soft"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5 text-sm">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-sm px-3 py-2 ${
            isActive(l.href, l.exact)
              ? "bg-white/10 text-white"
              : "text-[#C9C1AE] hover:bg-white/5 hover:text-white"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
