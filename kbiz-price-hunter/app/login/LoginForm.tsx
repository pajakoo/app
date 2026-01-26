"use client";

import { useState } from "react";

export default function LoginForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setLink(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    const response = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "Unable to send magic link.");
      setLoading(false);
      return;
    }

    setStatus(payload.message ?? "Magic link sent.");
    setLink(payload.magicLink ?? null);
    setLoading(false);
  }

  return (
    <div className="section">
      <form className="form-shell" onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" placeholder="you@domain.com" required />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
      {status ? (
        <div className="card" style={{ marginTop: 20 }}>
          <p>{status}</p>
          {link ? (
            <p style={{ marginTop: 8 }}>
              Dev-only link: <a href={link}>{link}</a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
