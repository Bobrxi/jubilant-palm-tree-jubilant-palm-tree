"use client";
import { useState } from "react";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) window.location.href = "/";
      else setErr("Wrong password");
    } catch {
      setErr("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>🎬 Content Farm — sign in</h1>
        <input
          type="password"
          placeholder="Dashboard password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={busy}>{busy ? "…" : "Enter"}</button>
        {err ? <div className="err">{err}</div> : null}
      </form>
    </div>
  );
}
