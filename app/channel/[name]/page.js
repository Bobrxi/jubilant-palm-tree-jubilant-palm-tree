import Link from "next/link";
import { getAnalytics, getChannels, getEvents, isConfigured } from "../../../lib/supabase";
import Shell from "../../shell";
import { aggregate } from "../../analytics";
import { compact, signed, clock } from "../../format";
import PerfChart from "../../perfchart";
import { LineChart } from "../../charts";
import ChannelAdmin from "../../channeladmin";

export const dynamic = "force-dynamic";

export default async function ChannelDetail({ params }) {
  const name = decodeURIComponent(params.name);

  if (!isConfigured()) {
    return (
      <Shell sub={"CHANNEL"}>
        <div className="empty">Not configured — set the Supabase env vars.</div>
      </Shell>
    );
  }

  const [rows, status, events] = await Promise.all([
    getAnalytics(),
    getChannels(),
    getEvents(250),
  ]);

  const a = aggregate(rows.filter((r) => r.channel === name));
  const ch = a.channels[0];
  const st = status.find((s) => s.channel === name) || {};
  const bad = (st.fails || 0) > 0;
  const chEvents = events.filter((e) => e.channel === name).slice(0, 18);

  const back = (
    <Link href="/channels" className="back-link">
      ← all channels
    </Link>
  );

  if (!ch) {
    return (
      <Shell sub={"CHANNEL"}>
        {back}
        <div className="empty">
          No analytics for <b>{name}</b> yet. Run <b>📈 Sync analytics → cloud</b> on
          your laptop (this channel may also need the one-time analytics auth).
        </div>
      </Shell>
    );
  }

  const watchHours = Math.round((ch.watchMinutes || 0) / 60);
  const bestDay = a.viewsByDay.reduce(
    (b, p) => (p.value > b.value ? p : b),
    { value: -1, date: "—" }
  );
  const avgPerDay = a.viewsByDay.length
    ? Math.round(a.viewsByDay.reduce((s, p) => s + p.value, 0) / a.viewsByDay.length)
    : 0;

  return (
    <Shell sub={"CHANNEL"}>
      {back}

      <div className="detail-head">
        <div className="detail-title">
          <h1>{name}</h1>
          <span className={"badge " + (bad ? "bad" : "ok")}>
            {bad ? `${st.fails} FAIL${st.fails > 1 ? "S" : ""}` : "OK"}
          </span>
        </div>
        <ChannelAdmin channel={name} bad={bad} />
      </div>
      {bad && st.last_error ? <div className="err-line">⚠ {st.last_error}</div> : null}

      <section className="stats detail-stats">
        <Stat n={compact(ch.subs)} l="Subscribers" accent="accent" />
        <Stat n={compact(ch.views)} l="Total views" accent="info" />
        <Stat n={compact(watchHours)} l="Watch hours" accent="ok" />
        <Stat n={compact(ch.videoCount)} l="Videos" />
        <Stat n={signed(ch.views7)} l="7-day views" accent="info" />
        <Stat
          n={signed(ch.subsGained28)}
          l="28-day net subs"
          accent={ch.subsGained28 >= 0 ? "ok" : "err"}
        />
      </section>

      <div className="section-title">
        <span>Trends</span>
        <span className="section-meta">{a.viewsByDay.length} days of data</span>
      </div>
      <div className="charts-grid">
        <PerfChart daily={a.viewsByDay} label="Views" color="var(--info)" />
        <PerfChart daily={a.watchByDay} label="Watch hours" color="var(--ok)" />
      </div>
      <div className="charts-grid">
        <LineChart data={a.subsByDay} label="Subscribers" color="var(--accent)" />
      </div>

      <div className="section-title">
        <span>At a glance</span>
        <span className="section-meta">key figures</span>
      </div>
      <div className="readout">
        <Read k="Best day" v={`${compact(bestDay.value)} views`} sub={bestDay.date} />
        <Read k="Avg views / day" v={compact(avgPerDay)} />
        <Read k="28-day views" v={compact(ch.views28)} />
        <Read k="Uploads (lifetime)" v={(st.uploads || 0).toLocaleString()} />
        <Read k="Last event" v={st.last_kind || "—"} sub={clock(st.last_event)} />
        <Read k="Data points" v={`${ch.days} days`} />
      </div>

      <div className="section-title">
        <span>Recent activity</span>
        <span className="section-meta">this channel</span>
      </div>
      <div className="feed">
        {chEvents.length === 0 ? (
          <div className="empty">No events logged for this channel yet.</div>
        ) : (
          chEvents.map((e, i) => (
            <div key={i} className={"ev ev2 lvl-" + (e.level || "info")}>
              <span className="t">{clock(e.ts)}</span>
              <span className="m">{e.msg}</span>
            </div>
          ))
        )}
      </div>
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

function Read({ k, v, sub }) {
  return (
    <div className="read">
      <div className="read-k">{k}</div>
      <div className="read-v">{v}</div>
      {sub ? <div className="read-sub">{sub}</div> : null}
    </div>
  );
}
