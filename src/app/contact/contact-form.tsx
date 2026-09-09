"use client";

import { useActionState, useState } from "react";
import { submitInquiry, type InquiryFormState } from "@/app/actions";
import { Field, Textarea } from "@/components/ui/field";

const initial: InquiryFormState = { status: "idle" };

export function ContactForm() {
  const [tab, setTab] = useState<"quick" | "detailed">("quick");
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.status === "success") {
    return (
      <div className="border border-line bg-ivory p-8 text-center">
        <h2 className="font-display text-2xl">Message sent</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thank you — we&rsquo;ve got your message and will reply within one business day.
        </p>
      </div>
    );
  }

  const err = (k: string) => (state.status === "error" ? state.fieldErrors?.[k] : undefined);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="type" value={tab === "quick" ? "QUICK" : "DETAILED"} />

      <div className="flex gap-7 border-b border-line">
        {(["quick", "detailed"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2.5 text-sm ${
              tab === t ? "border-wine font-medium" : "border-transparent text-ink-soft"
            }`}
          >
            {t === "quick" ? "Quick message" : "Detailed quote request"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" name="name" required error={err("name")} />
        </div>
        <Field label="Email" name="email" type="email" required error={err("email")} />
        <Field label="Phone" name="phone" type="tel" />

        {tab === "detailed" && (
          <>
            <Field label="Event date" name="eventDate" type="date" />
            <Field label="Venue" name="venue" />
            <Field label="Guest count" name="guestCount" />
            <Field label="Caterer (optional)" name="caterer" />
            <Field label="Event planner (optional)" name="planner" />
          </>
        )}

        <div className="sm:col-span-2">
          <Textarea
            label={tab === "quick" ? "Message" : "What are you looking for?"}
            name="message"
            required={tab === "quick"}
            error={err("message")}
          />
        </div>
      </div>

      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.status === "error" && (
        <p className="border-l-2 border-wine bg-ivory px-4 py-3 text-sm text-wine">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-wine px-8 py-3 text-sm font-medium text-white hover:bg-[#652638] disabled:opacity-50"
      >
        {pending ? "Sending…" : tab === "quick" ? "Send message" : "Send detailed request"}
      </button>
    </form>
  );
}
