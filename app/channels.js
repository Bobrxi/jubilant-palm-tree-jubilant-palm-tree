"use client";
import { useAdmin } from "./useAdmin";
import { timeAgo } from "./format";

// Channel "rack units" with per-channel admin actions. Channels are pre-sorted
// failing-first by the server; we just render + wire the buttons here.
export default function Channels({ channels }) {
  const { run, busy } = useAdmin();

  if (!channels || channels.length === 0) {
    return (
      <div className="empty">
        No channel data yet. Run the pipeline on your laptop and events will appear here.
      </div>
    );
  }

  return (
    <div className="grid">
      {channels.map((c, i) => {
        const bad = (c.fails || 0) > 0;
        const dKey = `dismiss:${c.channel}`;
        const rKey = `reset:${c.channel}`;
        return (
          <div
            key={c.channel}
            className={"card" + (bad ? " bad" : "")}
            style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
          >
            <span className="rail" />
            <div className="ch">
              <span className="ch-name">{c.channel}</span>
              <span className={"badge " + (bad ? "bad" : "ok")}>
                {bad ? `${c.fails} FAIL${c.fails > 1 ? "S" : ""}` : "OK"}
              </span>
            </div>
            <div className="row">
              <span className="k">uploads</span>
              <span className="v">{(c.uploads || 0).toLocaleString()}</span>
            </div>
            <div className="row">
              <span className="k">last event</span>
              <span className="v">{timeAgo(c.last_event)}</span>
            </div>
            <div className="row">
              <span className="k">last</span>
              <span className="v">{c.last_kind || "—"}</span>
            </div>
            {bad && c.last_error ? <div className="err-line">⚠ {c.last_error}</div> : null}

            <div className="card-actions">
              {bad ? (
                <button
                  className="chip chip-warn"
                  disabled={busy === dKey}
                  onClick={() =>
                    run("dismiss_fails", {
                      channel: c.channel,
                      key: dKey,
                      confirm: `Dismiss the failing state for "${c.channel}"? (resets its fail count to 0)`,
                    })
                  }
                >
                  {busy === dKey ? "…" : "✓ dismiss"}
                </button>
              ) : null}
              <button
                className="chip chip-danger"
                disabled={busy === rKey}
                onClick={() =>
                  run("reset_channel", {
                    channel: c.channel,
                    key: rKey,
                    confirm: `Reset ALL data for "${c.channel}"? Deletes its events and status row. Cannot be undone.`,
                  })
                }
              >
                {busy === rKey ? "…" : "⟲ reset"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
