"use client";
import { useState, type FormEvent } from "react";
export default function Login() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError("");
    const form = event.currentTarget;
    try {
      const password = new FormData(form).get("password");
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) { setError("Invalid password / 密码错误"); return; }
      form.reset(); window.location.replace("/");
    } catch { setError("Unable to sign in. Please retry."); }
    finally { setPending(false); }
  }
  return <main className="min-h-screen flex items-center justify-center p-6"><form onSubmit={login} className="w-full max-w-sm space-y-4">
    <h1 className="text-2xl font-semibold">Deep Research</h1>
    <label htmlFor="password" className="block">Access password / 访问密码</label>
    <input id="password" name="password" type="password" required autoComplete="current-password" className="w-full rounded border p-3 text-black" />
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={pending} className="w-full rounded bg-blue-600 text-white p-3">{pending ? "Signing in…" : "Sign in / 登录"}</button>
  </form></main>;
}
