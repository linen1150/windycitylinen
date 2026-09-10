"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Phone, Search, X } from "lucide-react";
import { useQuote } from "@/components/quote/quote-store";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/design-center", label: "Design Center" },
  { href: "/my-inspirations", label: "My Inspirations" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

function HeaderSearch({ className = "", onSubmit }: { className?: string; onSubmit?: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
        onSubmit?.();
      }}
      className={`flex items-center gap-2 border border-line bg-paper px-3 py-2 focus-within:border-ink ${className}`}
    >
      <Search size={15} className="shrink-0 text-ink-soft" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search linens — color, fabric, style…"
        aria-label="Search the catalog"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
    </form>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count, open } = useQuote();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-paper">
      <div className="flex items-center justify-between bg-ink px-4 py-2 text-[13px] text-[#EDE7D8] sm:px-8">
        <span className="hidden sm:block">Serving Chicagoland &amp; Milwaukee since 2008</span>
        <a href={`tel:${SITE.phoneHref}`} className="flex items-center gap-1.5 hover:underline">
          <Phone size={13} /> {SITE.phone}
        </a>
      </div>

      <div className="flex items-center gap-4 border-b border-line px-4 py-4 sm:px-8 lg:gap-6">
        <Link href="/" className="shrink-0 font-script text-3xl leading-none text-ink">
          Windy City Linen
        </Link>

        <HeaderSearch className="hidden w-full max-w-xs md:flex lg:max-w-sm" />

        <nav className="hidden items-center gap-5 text-sm xl:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap hover:text-brass-dark ${
                  active ? "text-brass-dark" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={open}
            className="relative whitespace-nowrap border border-line px-3.5 py-2 text-[13px] hover:border-ink"
          >
            Quote request
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-wine text-[11px] text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/contact"
            className="hidden whitespace-nowrap bg-ink px-4 py-2.5 text-[13px] text-[#EDE7D8] hover:bg-black sm:block"
          >
            Request a quote
          </Link>
          <button
            className="xl:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Search on small screens, where it doesn't fit in the row above */}
      <div className="border-b border-line px-4 py-2.5 sm:px-8 md:hidden">
        <HeaderSearch />
      </div>

      {menuOpen && (
        <nav className="border-b border-line bg-paper px-4 py-3 xl:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm"
            >
              {item.label}
            </Link>
          ))}
          <a href={`tel:${SITE.phoneHref}`} className="block py-2.5 text-sm text-brass-dark">
            Call {SITE.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
