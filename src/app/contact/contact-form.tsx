"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryFormState } from "@/app/actions";
import { Field, Textarea } from "@/components/ui/field";

const initial: InquiryFormState = { status: "idle" };

export function ContactForm() {
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
      <input type="hidden" name="type" value="QUICK" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" name="name" required error={err("name")} />
        </div>
        <Field label="Email" name="email" type="email" required error={err("email")} />
        <Field label="Phone" name="phone" type="tel" />
        <div className="sm:col-span-2">
          <Textarea label="Message" name="message" required error={err("message")} />
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
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
