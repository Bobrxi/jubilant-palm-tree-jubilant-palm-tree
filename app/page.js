import { getChannels, getEvents, getStats, getAnalytics, isConfigured } from "../lib/supabase";
import Refresher from "./refresher";
import Controls from "./controls";
import Channels from "./channels";
import Feed from "./feed";
import Performers from "./performers";
import { LineChart } from "./charts";
import { aggregate } from "./analytics";
import { compact } from "./format";

export const dynamic = "force-dynamic";

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

  const [channels, events, stats, analyticsRows] = await Promise.all([
    getChannels(),
    getEvents(80),
    getStats(),
    getAnalytics(),
  ]);

  const a = aggregate(analyticsRows);

  // Failing channels float to the top, then by upload volume.
  const sorted = [...channels].sort((a, b) => {
    const fa = a.fails || 0, fb = b.fails || 0;
    if (fb !== fa) return fb - fa;
    return (b.uploads || 0) - (a.uploads || 0);
  });

  const totalUploads = channels.reduce((s, c) => s + (c.uploads || 0), 0);
  const failing = channels.filter((c) => (c.fails || 0) > 0);

  return (
    <div className="wrap">
      <Refresher seconds={15} />

      <header className="masthead">
        <div className="brand">
          <span className="logo">▣</span>
          <div className="brand-text">
            <div className="brand-title">CONTENT FARM</div>
            <div className="brand-sub">// OPS CONTROL</div>
          </div>
        </div>
        <div className="masthead-right">
          <div className="live">
            <span className="dot" /> LIVE · 15s
          </div>
          <Controls />
        </div>
      </header>

      <section className="stats">
        <Stat n={compact(a.totalSubs)} l="Total subscribers" accent="accent" />
        <Stat n={compact(a.totalViews)} l="Total views" accent="info" />
        <Stat n={channels.length} l="Channels" />
        <Stat n={totalUploads.toLocaleString()} l="Total uploads" />
        <Stat n={stats.uploads24.toLocaleString()} l="Uploads · 24h" accent="info" />
        <Stat
          n={stats.successRate == null ? "—" : `${stats.successRate}%`}
          l="Success rate"
          accent={stats.successRate != null && stats.successRate < 80 ? "warn" : "ok"}
        />
        <Stat n={failing.length} l="Channels failing" accent={failing.length ? "err" : null} />
        <Stat n={events.length} l="Recent events" />
      </section>

      <div className="section-title">
        <span>Performance</span>
        <span className="section-meta">
          {a.hasData ? "channel analytics · backfilled daily" : "no analytics synced yet"}
        </span>
      </div>
      <div className="charts-grid">
        <LineChart data={a.viewsByDay} label="Views / day · all channels" color="var(--info)" />
        <LineChart data={a.subsByDay} label="Total subscribers" color="var(--accent)" />
      </div>

      <div className="section-title">
        <span>Top performers</span>
        <span className="section-meta">ranked · toggle metric</span>
      </div>
      <Performers channels={a.channels} />

      <div className="section-title">
        <span>Channels</span>
        <span className="section-meta">{sorted.length} tracked · failing first</span>
      </div>
      <Channels channels={sorted} />

      <div className="section-title">
        <span>Activity</span>
        <span className="section-meta">live operational log</span>
      </div>
      <Feed events={events} />
    </div>
  );
}

function Stat({ n, l, accent }) {
  const style = accent ? { "--stat-accent": `var(--${accent})` } : null;
  return (
    <div className={"stat" + (accent ? " accented" : "")} style={style}>
      <div className="n">{n}</div>
      <div className="l">{l}</div>
    </div>
  );
}
