import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Windy City Linen. Serving weddings, galas and corporate events across Chicago and Milwaukee. A real person replies within one business day.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="text-center font-display text-3xl">Let&rsquo;s talk about your event</h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-ink-soft">
        Send us a note and a real person replies within one business day. Prefer to
        talk? Call{" "}
        <a href={`tel:${SITE.phoneHref}`} className="text-wine underline">{SITE.phone}</a>.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
