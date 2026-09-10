import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`border border-line bg-white ${className}`} {...props} />;
}

export const adminInput =
  "w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
export const adminLabel = "mb-1 block text-xs font-medium text-ink-soft";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={adminLabel}>{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-wine">{error}</span>}
    </label>
  );
}

const btn =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50";

export const buttonCls = {
  primary: `${btn} bg-ink text-white hover:bg-black`,
  secondary: `${btn} border border-line bg-white hover:border-ink`,
  danger: `${btn} border border-wine/40 bg-white text-wine hover:bg-wine hover:text-white`,
};

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonCls }) {
  return <Link className={`${buttonCls[variant]} ${className}`} {...props} />;
}

export function SubmitButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonCls }) {
  return <button className={`${buttonCls[variant]} ${className}`} {...props} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
      {children}
    </div>
  );
}
