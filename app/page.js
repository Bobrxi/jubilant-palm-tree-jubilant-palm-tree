import { getChannels, getEvents, isConfigured } from "../lib/supabase";
import Refresher from "./refresher";

export const dynamic = "force-dynamic";

function timeAgo(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function clock(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export default async function Page() {
  if (!isConfigured()) {
    return (
      <div className="wrap">
        <div className="empty">
          Not configured. Set <b>SUPABASE_URL</b> and <b>SUPABASE_SERVICE_KEY</b> in
          your Vercel environment variables, then redeploy.
        </div>
      </div>
    );
  }

  const [channels, events] = await Promise.all([getChannels(), getEvents(60)]);

  const totalUploads = channels.reduce((s, c) => s + (c.uploads || 0), 0);
  const failing = channels.filter((c) => (c.fails || 0) > 0);

  return (
    <div className="wrap">
      <Refresher seconds={15} />

      <div className="header">
        <div className="title">🎬 Content Farm</div>
        <div className="live"><span className="dot" /> live · auto-refresh 15s</div>
      </div>

      <div className="stats">
        <div className="stat"><div className="n">{channels.length}</div><div className="l">Channels</div></div>
        <div className="stat"><div className="n">{totalUploads.toLocaleString()}</div><div className="l">Total uploads</div></div>
        <div className="stat" style={failing.length ? { borderColor: "var(--err)" } : null}>
          <div className="n" style={failing.length ? { color: "var(--err)" } : null}>{failing.length}</div>
          <div className="l">Channels failing</div>
        </div>
        <div className="stat"><div className="n">{events.length}</div><div className="l">Recent events</div></div>
      </div>

      <div className="section-title">Channels</div>
      {channels.length === 0 ? (
        <div className="empty">No channel data yet. Run the pipeline on your laptop and events will appear here.</div>
      ) : (
        <div className="grid">
          {channels.map((c) => {
            const bad = (c.fails || 0) > 0;
            return (
              <div key={c.channel} className={"card" + (bad ? " bad" : "")}>
                <div className="ch">
                  {c.channel}
                  <span className={"badge " + (bad ? "bad" : "ok")}>{bad ? `${c.fails} fails` : "ok"}</span>
                </div>
                <div className="row"><span className="k">uploads</span><span>{(c.uploads || 0).toLocaleString()}</span></div>
                <div className="row"><span className="k">last event</span><span>{timeAgo(c.last_event)}</span></div>
                <div className="row"><span className="k">last</span><span>{c.last_kind || "—"}</span></div>
                {bad && c.last_error ? <div className="err-line">⚠ {c.last_error}</div> : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="section-title">Recent activity</div>
      <div className="feed">
        {events.length === 0 ? (
          <div className="empty">No events yet.</div>
        ) : (
          events.map((e, i) => (
            <div key={i} className={"ev lvl-" + (e.level || "info")}>
              <span className="t">{clock(e.ts)}</span>
              <span className="c">{e.channel || "pipeline"}</span>
              <span className="m">{e.msg}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
