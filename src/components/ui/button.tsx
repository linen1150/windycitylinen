import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none";

export const buttonVariants = {
  primary: `${base} bg-brass text-white hover:bg-brass-dark`,
  secondary: `${base} border border-ink text-ink hover:bg-ink hover:text-white`,
  ghost: `${base} border border-line text-ink hover:border-ink`,
  dark: `${base} bg-ink text-[#EDE7D8] hover:bg-black`,
} as const;

type Variant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${buttonVariants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${buttonVariants[variant]} ${className}`} {...props} />;
}
