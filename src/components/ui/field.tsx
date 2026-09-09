import type { ComponentProps } from "react";

const inputCls =
  "w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink";

export function Field({
  label,
  name,
  error,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; name: string; error?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
        {props.required && <span className="text-wine"> *</span>}
      </span>
      <input name={name} className={`${inputCls} ${error ? "border-wine" : ""}`} {...props} />
      {hint && !error && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-wine">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  name,
  error,
  ...props
}: ComponentProps<"textarea"> & { label: string; name: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
        {props.required && <span className="text-wine"> *</span>}
      </span>
      <textarea
        name={name}
        rows={4}
        className={`${inputCls} ${error ? "border-wine" : ""}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-wine">{error}</span>}
    </label>
  );
}
