import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink px-4 py-12 text-[13px] text-[#C9C1AE] sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="font-script text-2xl text-[#EDE7D8]">Windy City Linen</div>
          <p className="mt-3 max-w-xs">
            Tablecloths, napkins, runners and chair covers for weddings, galas and
            corporate events across {SITE.serviceArea}.
          </p>
        </div>
        <div>
          <div className="mb-2 font-medium text-[#EDE7D8]">Explore</div>
          <ul className="space-y-1.5">
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
            <li><Link href="/search" className="hover:text-white">Search the catalog</Link></li>
            <li><Link href="/design-center" className="hover:text-white">Design Center</Link></li>
            <li><Link href="/my-inspirations" className="hover:text-white">My Inspirations</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-medium text-[#EDE7D8]">Contact</div>
          <ul className="space-y-1.5">
            <li><a href={`tel:${SITE.phoneHref}`} className="hover:text-white">{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></li>
            <li>{SITE.showrooms.join(" · ")}</li>
            <li><Link href="/contact" className="hover:text-white">Request a quote</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-5 text-xs">
        © {new Date().getFullYear()} Windy City Linen. Serving Chicagoland &amp; Milwaukee since {SITE.since}.
      </div>
    </footer>
  );
}
