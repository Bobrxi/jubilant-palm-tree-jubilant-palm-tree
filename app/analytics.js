// Pure aggregation over channel_analytics rows. No I/O, no React — just turns
// the raw daily rows into the shapes the dashboard renders. Safe to import from
// server components.

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Sum a metric over the last `days` of a per-channel series (rows have .date).
function lastDaysSum(series, days, pick) {
  if (!series.length) return 0;
  const cutoff = new Date(series[series.length - 1].date);
  cutoff.setDate(cutoff.getDate() - days);
  return series.reduce(
    (s, r) => (new Date(r.date) >= cutoff ? s + pick(r) : s),
    0
  );
}

export function aggregate(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    return {
      hasData: false,
      channels: [],
      totalSubs: 0,
      totalViews: 0,
      viewsByDay: [],
      subsByDay: [],
    };
  }

  // ── Group by channel ────────────────────────────────────────────────────
  const byChannel = new Map();
  for (const r of list) {
    const id = r.channel_id || r.channel || "?";
    if (!byChannel.has(id)) byChannel.set(id, []);
    byChannel.get(id).push(r);
  }

  const channels = [];
  for (const [id, rawSeries] of byChannel) {
    const series = [...rawSeries].sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
    const latest = series[series.length - 1];
    // subs/views totals come from the most recent row that actually has them
    let subs = 0,
      views = 0,
      videoCount = 0;
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i].subs_total != null) {
        subs = num(series[i].subs_total);
        views = num(series[i].views_total);
        videoCount = num(series[i].video_count);
        break;
      }
    }
    channels.push({
      channel_id: id,
      channel: latest.channel || id,
      subs,
      views,
      videoCount,
      views7: lastDaysSum(series, 7, (r) => num(r.views)),
      views28: lastDaysSum(series, 28, (r) => num(r.views)),
      subsGained28: lastDaysSum(
        series,
        28,
        (r) => num(r.subs_gained) - num(r.subs_lost)
      ),
      watchMinutes: series.reduce((s, r) => s + num(r.minutes_watched), 0),
      days: series.length,
      spark: series.map((r) => num(r.views)),
    });
  }

  const totalSubs = channels.reduce((s, c) => s + c.subs, 0);
  const totalViews = channels.reduce((s, c) => s + c.views, 0);

  // ── All-channel daily series ────────────────────────────────────────────
  const viewsMap = new Map();
  const watchMap = new Map(); // watch hours per day
  const netMap = new Map(); // net subscriber change per day
  for (const r of list) {
    const d = String(r.date);
    viewsMap.set(d, (viewsMap.get(d) || 0) + num(r.views));
    watchMap.set(d, (watchMap.get(d) || 0) + num(r.minutes_watched));
    netMap.set(d, (netMap.get(d) || 0) + num(r.subs_gained) - num(r.subs_lost));
  }
  const dates = Array.from(viewsMap.keys()).sort();
  const viewsByDay = dates.map((d) => ({ date: d, value: viewsMap.get(d) }));
  const watchByDay = dates.map((d) => ({ date: d, value: Math.round(watchMap.get(d) / 60) }));

  // ── Total subscribers over time ─────────────────────────────────────────
  // The Data API only gives the CURRENT total; the Analytics API gives daily
  // net changes. So reconstruct the historical curve: walk the cumulative net
  // forward from a baseline chosen so the final point equals the live total.
  let cum = 0;
  const cumByDate = new Map();
  for (const d of dates) {
    cum += netMap.get(d) || 0;
    cumByDate.set(d, cum);
  }
  const baseline = totalSubs - cum;
  const subsByDay = dates.map((d) => ({
    date: d,
    value: baseline + cumByDate.get(d),
  }));

  const totalWatchHours = channels.reduce(
    (s, c) => s + Math.round(c.watchMinutes / 60),
    0
  );

  channels.sort((a, b) => b.views - a.views);

  return {
    hasData: true,
    channels,
    totalSubs,
    totalViews,
    totalWatchHours,
    viewsByDay,
    watchByDay,
    subsByDay,
  };
}

// Re-bucket a daily flow series [{date,value}] by granularity. "cumulative"
// returns a running total (a level, not a flow). Used by the views chart toggle.
// Note: YouTube's API is daily at finest — there is no hourly granularity.
export function bucket(daily, mode) {
  const d = daily || [];
  if (mode === "cumulative") {
    let s = 0;
    return d.map((p) => ({ date: p.date, value: (s += num(p.value)) }));
  }
  if (mode === "day" || !mode) return d;
  const key =
    mode === "month"
      ? (dt) => String(dt).slice(0, 7)
      : (dt) => mondayOf(String(dt));
  const map = new Map();
  for (const p of d) {
    const k = key(p.date);
    map.set(k, (map.get(k) || 0) + num(p.value));
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

function mondayOf(s) {
  const dt = new Date(s + "T00:00:00");
  const back = (dt.getDay() + 6) % 7; // 0 = Monday
  dt.setDate(dt.getDate() - back);
  return dt.toISOString().slice(0, 10);
}
