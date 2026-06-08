"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Shared client helper for the admin mutations. Handles the confirm prompt,
// the POST to /api/admin, a busy flag (with the key of the in-flight action),
// and refreshing the server components so the UI reflects the change.
export function useAdmin() {
  const router = useRouter();
  const [busy, setBusy] = useState(null); // a string key while running, else null

  async function run(action, { channel, confirm: confirmMsg, key } = {}) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(key || action);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, channel }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        window.alert("Action failed: " + (j.error || res.status));
      }
      router.refresh();
    } catch (e) {
      window.alert("Action failed: " + e);
    } finally {
      setBusy(null);
    }
  }

  return { run, busy };
}
