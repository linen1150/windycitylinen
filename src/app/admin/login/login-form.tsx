"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initial: LoginState = {};

const inputCls =
  "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-soft">Email</span>
        <input name="email" type="email" autoComplete="username" required className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-soft">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </label>

      {state.error && (
        <p className="border-l-2 border-wine bg-ivory px-3 py-2 text-sm text-wine">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
