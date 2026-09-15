"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Phone, Search, X } from "lucide-react";
import { useInspirations } from "@/components/inspirations/inspirations-store";
import { ProductImage } from "@/components/catalog/product-image";
import type { ProductCardData } from "@/lib/catalog";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/design-center", label: "Design Center" },
  { href: "/my-inspirations", label: "My Inspirations" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const QUOTE_LINK = { href: "/quote", label: "Quote" };

function HeaderSearch({ className = "", onSubmit }: { className?: string; onSubmit?: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<ProductCardData[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { products: ProductCardData[] }) => {
          setSuggestions(data.products);
          setActiveIndex(-1);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goToSearch = () => {
    router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
    setOpen(false);
    onSubmit?.();
  };

  const goToProduct = (p: ProductCardData) => {
    router.push(`/product/${p.slug}`);
    setOpen(false);
    onSubmit?.();
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            goToProduct(suggestions[activeIndex]);
          } else {
            goToSearch();
          }
        }}
        className="flex items-center gap-2 border border-line bg-paper px-3 py-2 focus-within:border-ink"
      >
        <Search size={15} className="shrink-0 text-ink-soft" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "Enter") {
              // Handled explicitly rather than left to native form-submit-on-Enter,
              // which isn't reliable across every input method.
              e.preventDefault();
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                goToProduct(suggestions[activeIndex]);
              } else {
                goToSearch();
              }
            }
          }}
          placeholder="Search linens — color, fabric, style…"
          aria-label="Search the catalog"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="header-search-suggestions"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="header-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-96 overflow-y-auto border border-line bg-paper shadow-lg"
        >
          {suggestions.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToProduct(p)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  i === activeIndex ? "bg-ivory" : ""
                }`}
              >
                <ProductImage
                  src={p.imageUrl}
                  alt=""
                  colorHex={p.colorHex}
                  className="h-9 w-9 shrink-0 border border-line"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{p.name}</span>
                  <span className="block truncate text-xs text-ink-soft">
                    {p.fabric} · {p.category}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={goToSearch}
              className="block w-full border-t border-line px-3 py-2 text-left text-xs text-brass-dark hover:underline"
            >
              See all results for &ldquo;{value.trim()}&rdquo;
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count } = useInspirations();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-paper print:hidden">
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
                {item.href === "/my-inspirations" && count > 0 && (
                  <span className="ml-1 text-ink-soft">({count})</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href={QUOTE_LINK.href}
            className="hidden whitespace-nowrap bg-brass px-4 py-2 text-sm font-medium text-white hover:bg-brass-dark sm:block"
          >
            {QUOTE_LINK.label}
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
          <Link
            href={QUOTE_LINK.href}
            onClick={() => setMenuOpen(false)}
            className="mb-2 block bg-brass px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-brass-dark"
          >
            {QUOTE_LINK.label}
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm"
            >
              {item.label}
              {item.href === "/my-inspirations" && count > 0 && (
                <span className="ml-1 text-ink-soft">({count})</span>
              )}
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
