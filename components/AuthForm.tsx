"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type Mode = "signin" | "signup";

export default function AuthForm() {
  const supabase = createSupabaseBrowserClient();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email" : null;
  const passwordError = touched.password && password.length < 6 ? "At least 6 characters" : null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm w-full">
      <h2 className="text-xl font-semibold">
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          required
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
          className="border rounded px-3 py-2"
        />
        {emailError && <p id="email-error" className="text-xs text-red-600">{emailError}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          required
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? 'password-error' : undefined}
          className="border rounded px-3 py-2"
        />
        {passwordError && <p id="password-error" className="text-xs text-red-600">{passwordError}</p>}
      </div>
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !!emailError || !!passwordError}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
      </button>
      <div className="text-sm">
        {mode === "signin" ? (
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="underline"
          >
            Need an account? Sign up
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="underline"
          >
            Have an account? Sign in
          </button>
        )}
      </div>
    </form>
  );
}


