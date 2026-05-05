"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (result?.error || !result?.ok) {
        setError("E-Mail oder Passwort falsch.");
        return;
      }
      router.replace(from);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="card p-6 space-y-4"
      autoComplete="on"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-xs eyebrow mb-1.5"
        >
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          className="w-full px-3 h-9 rounded-md border hairline bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--ink-soft)]"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-xs eyebrow mb-1.5"
        >
          Passwort
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-3 h-9 rounded-md border hairline bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--ink-soft)]"
        />
      </div>
      {error && (
        <div className="text-xs text-red-500 px-1">{error}</div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-9 rounded-md bg-[var(--ink)] text-[var(--bg)] text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Anmelden…" : "Anmelden"}
      </button>
    </form>
  );
}
