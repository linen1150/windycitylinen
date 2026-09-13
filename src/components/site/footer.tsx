import type { ComponentType } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { FacebookIcon, InstagramIcon, PinterestIcon } from "./social-icons";

const ICONS: Partial<Record<string, ComponentType<{ size?: number }>>> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  Pinterest: PinterestIcon,
};

export function Footer() {
  return (
    <footer className="mt-auto bg-ink px-4 pt-8 pb-24 text-center text-[13px] text-[#C9C1AE] sm:px-8 sm:pb-10 print:hidden">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>
          Phone:{" "}
          <a href={`tel:${SITE.phoneHref}`} className="hover:text-white">
            {SITE.phone}
          </a>
        </span>
        <span aria-hidden>|</span>
        <span>
          Email:{" "}
          <a href={`mailto:${SITE.ordersEmail}`} className="hover:text-white">
            {SITE.ordersEmail}
          </a>
        </span>
        {SITE.locations.map((loc) => (
          <span key={loc.name} className="contents">
            <span aria-hidden>|</span>
            <span>
              Address:{" "}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                {loc.address}
              </a>
            </span>
          </span>
        ))}
      </p>
      <p className="mt-2">
        {new Date().getFullYear()} &copy; Copyright Windy City Linen &middot;{" "}
        <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
      </p>

      {SITE.social.length > 0 && (
        <div className="mt-4 flex justify-center gap-4">
          {SITE.social.map(({ name, href }) => {
            const Icon = ICONS[name];
            return (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-[#C9C1AE] hover:text-white"
              >
                {Icon ? <Icon size={18} /> : name}
              </a>
            );
          })}
        </div>
      )}
    </footer>
  );
}
