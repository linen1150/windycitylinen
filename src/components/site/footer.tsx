import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink px-4 py-8 text-center text-[13px] text-[#C9C1AE] sm:px-8">
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
        <span aria-hidden>|</span>
        <span>Address: 1150 Willis Avenue Wheeling, IL 60090</span>
      </p>
      <p className="mt-2">{new Date().getFullYear()} &copy; Copyright Windy City Linen</p>
    </footer>
  );
}
