"use client";
import { useAdmin } from "./useAdmin";

// Per-channel destructive actions for the detail page. Confirm-gated.
export default function ChannelAdmin({ channel, bad }) {
  const { run, busy } = useAdmin();
  const dKey = `dismiss:${channel}`;
  const rKey = `reset:${channel}`;
  return (
    <div className="detail-actions">
      {bad ? (
        <button
          className="chip chip-warn"
          disabled={busy === dKey}
          onClick={() =>
            run("dismiss_fails", {
              channel,
              key: dKey,
              confirm: `Dismiss the failing state for "${channel}"? (resets its fail count to 0)`,
            })
          }
        >
          {busy === dKey ? "…" : "✓ dismiss fails"}
        </button>
      ) : null}
      <button
        className="chip chip-danger"
        disabled={busy === rKey}
        onClick={() =>
          run("reset_channel", {
            channel,
            key: rKey,
            confirm: `Reset ALL ops data for "${channel}"? Deletes its events and status row. Cannot be undone.`,
          })
        }
      >
        {busy === rKey ? "…" : "⟲ reset ops data"}
      </button>
    </div>
  );
}
