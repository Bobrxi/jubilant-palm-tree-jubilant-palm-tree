import { getAnalytics, isConfigured } from "../lib/supabase";
import Shell from "./shell";
import { aggregate } from "./analytics";
import { compact } from "./format";
import PerfChart from "./perfchart";
import { LineChart } from "./charts";
import Performers from "./performers";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!isConfigured()) {
    return (
      <Shell sub="PERFORMANCE">
        <div className="empty">
          Not configured. Set <b>SUPABASE_URL</b> and <b>SUPABASE_SERVICE_KEY</b> in
          your Vercel environment variables, then redeploy.
        </div>
      </Shell>
    );
  }

  const a = aggregate(await getAnalytics());

  // Momentum: last 7 days of views vs the 7 before that.
  const vd = a.viewsByDay;
  const sum = (arr) => arr.reduce((s, p) => s + (p.value || 0), 0);
  const last7 = sum(vd.slice(-7));
  const prev7 = sum(vd.slice(-14, -7));
  const momentum = prev7 ? Math.round((100 * (last7 - prev7)) / prev7) : null;

  return (
    <Shell sub="PERFORMANCE">
      <section className="stats">
        <Stat n={compact(a.totalSubs)} l="Total subscribers" accent="accent" />
        <Stat n={compact(a.totalViews)} l="Total views" accent="info" />
        <Stat n={compact(a.totalWatchHours)} l="Watch hours" accent="ok" />
        <Stat
          n={momentum == null ? "—" : `${momentum > 0 ? "+" : ""}${momentum}%`}
          l="7-day momentum"
          accent={momentum == null ? null : momentum >= 0 ? "ok" : "err"}
        />
        <Stat n={a.channels.length} l="Channels" />
      </section>

      <div className="section-title">
        <span>Views over time</span>
        <span className="section-meta">all channels · daily is YouTube's finest grain</span>
      </div>
      <div className="charts-grid">
        <PerfChart daily={a.viewsByDay} label="Views" color="var(--info)" />
        <PerfChart daily={a.watchByDay} label="Watch hours" color="var(--ok)" />
      </div>

      <div className="section-title">
        <span>Subscribers</span>
        <span className="section-meta">total across all channels · reconstructed curve</span>
      </div>
      <div className="charts-grid">
        <LineChart data={a.subsByDay} label="Total subscribers" color="var(--accent)" />
      </div>

      <div className="section-title">
        <span>All-time top performers</span>
        <span className="section-meta">ranked across every channel · toggle metric</span>
      </div>
      <Performers channels={a.channels} />
    </Shell>
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
