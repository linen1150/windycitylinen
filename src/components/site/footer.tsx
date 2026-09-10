import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink px-4 py-12 text-[13px] text-[#C9C1AE] sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center sm:flex-row sm:justify-center sm:gap-16 sm:text-left">
        <div>
          <div className="font-script text-2xl text-[#EDE7D8]">Windy City Linen</div>
          <p className="mx-auto mt-3 max-w-xs sm:mx-0">
            Tablecloths, napkins, runners and chair covers for weddings, galas and
            corporate events across {SITE.serviceArea}.
          </p>
        </div>
        <div>
          <div className="mb-2 font-medium text-[#EDE7D8]">Contact</div>
          <ul className="space-y-1.5">
            <li><a href={`tel:${SITE.phoneHref}`} className="hover:text-white">{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></li>
            <li>{SITE.showrooms.join(" · ")}</li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-5 text-center text-xs">
        © {new Date().getFullYear()} Windy City Linen. Serving Chicagoland &amp; Milwaukee since {SITE.since}.
      </div>
    </footer>
  );
}
