"use client";
import { useAdmin } from "./useAdmin";

// Global, destructive actions live in the masthead. Both are confirm-gated.
export default function Controls() {
  const { run, busy } = useAdmin();
  return (
    <div className="ctrl-bar">
      <button
        className="btn btn-ghost"
        disabled={busy === "clear_events"}
        onClick={() =>
          run("clear_events", {
            key: "clear_events",
            confirm:
              "Clear the entire activity feed? Channel upload counts are kept. This cannot be undone.",
          })
        }
      >
        {busy === "clear_events" ? "CLEARING…" : "✦ CLEAR LOG"}
      </button>
      <button
        className="btn btn-danger"
        disabled={busy === "reset_all"}
        onClick={() =>
          run("reset_all", {
            key: "reset_all",
            confirm:
              "RESET EVERYTHING — wipes all events AND all channel status rows. This cannot be undone. Continue?",
          })
        }
      >
        {busy === "reset_all" ? "RESETTING…" : "⟲ RESET ALL"}
      </button>
    </div>
  );
}
