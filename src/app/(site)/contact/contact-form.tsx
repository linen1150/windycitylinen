"use client";

import { useActionState } from "react";
import type { ComponentProps } from "react";
import { submitInquiry, type InquiryFormState } from "@/app/actions";

const initial: InquiryFormState = { status: "idle" };

const fieldCls =
  "w-full rounded-[2px] border border-transparent bg-[#D9D1C0] px-4 py-3 text-sm text-ink placeholder:text-ink-soft outline-none focus:border-ink";

function TextField({
  name,
  placeholder,
  error,
  type = "text",
  ...props
}: ComponentProps<"input"> & { name: string; placeholder: string; error?: string }) {
  return (
    <div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${fieldCls} ${error ? "border-wine" : ""}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-wine">{error}</p>}
    </div>
  );
}

export function ContactForm({ subject = "" }: { subject?: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.status === "success") {
    return (
      <div className="mt-6 border border-line bg-ivory p-8 text-center">
        <h3 className="font-display text-2xl">Message sent</h3>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thank you — we&rsquo;ve got your message and will reply within one business day.
        </p>
      </div>
    );
  }

  const err = (k: string) => (state.status === "error" ? state.fieldErrors?.[k] : undefined);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="type" value="DETAILED" />

      <TextField name="name" placeholder="Name" required error={err("name")} />
      <TextField name="email" type="email" placeholder="Email" required error={err("email")} />
      <TextField name="phone" type="tel" placeholder="Phone" />
      <TextField name="subject" placeholder="Subject" defaultValue={subject} />
      <TextField name="eventDate" placeholder="Event Date" />
      <TextField name="venue" placeholder="Venue" />
      <TextField name="caterer" placeholder="Caterer" />
      <TextField name="planner" placeholder="Event Planner" />
      <TextField name="howHeard" placeholder="How did you hear about us?" />

      <div>
        <textarea
          name="message"
          placeholder="Message"
          aria-label="Message"
          rows={5}
          className={`${fieldCls} resize-y`}
        />
      </div>

      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.status === "error" && (
        <p className="border-l-2 border-wine bg-ivory px-4 py-3 text-sm text-wine">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 bg-ink px-10 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
