"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useQuote } from "@/components/quote/quote-store";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/search", label: "Search" },
  { href: "/design-center", label: "Design Center" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

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

      <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-8">
        <Link href="/" className="font-script text-3xl leading-none">
          Windy City <span className="text-brass-dark">Linen</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-brass-dark ${active ? "text-brass-dark" : "text-ink"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={open}
            className="relative border border-line px-3.5 py-2 text-[13px] hover:border-ink"
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
            className="hidden bg-ink px-4 py-2.5 text-[13px] text-[#EDE7D8] hover:bg-black sm:block"
          >
            Request a quote
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-b border-line bg-paper px-4 py-3 lg:hidden">
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
