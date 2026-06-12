"use client";
import { useState } from "react";
import { compact, signed } from "./format";
import { Sparkline } from "./charts";

const METRICS = [
  { key: "views", label: "TOTAL VIEWS", pick: (c) => c.views, fmt: (c) => compact(c.views) },
  { key: "subs", label: "SUBSCRIBERS", pick: (c) => c.subs, fmt: (c) => compact(c.subs) },
  { key: "growth", label: "7-DAY VIEWS", pick: (c) => c.views7, fmt: (c) => signed(c.views7) },
];

// Ranked channel leaderboard with a metric toggle + per-channel sparkline.
export default function Performers({ channels }) {
  const [metric, setMetric] = useState("views");

  if (!channels || channels.length === 0) {
    return (
      <div className="empty">
        No analytics yet. Run <b>📊 Sync analytics → cloud</b> on your laptop, then
        this fills in (channels need the one-time analytics authorization for graphs).
      </div>
    );
  }

  const active = METRICS.find((m) => m.key === metric) || METRICS[0];
  const ranked = [...channels].sort((a, b) => active.pick(b) - active.pick(a));
  const top = active.pick(ranked[0]) || 1;

  return (
    <div>
      <div className="metric-toggle">
        {METRICS.map((m) => (
          <button
            key={m.key}
            className={"seg-btn" + (metric === m.key ? " on" : "")}
            onClick={() => setMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="perf-list">
        {ranked.map((c, i) => {
          const val = active.pick(c);
          const pct = Math.max(2, Math.round((100 * Math.abs(val)) / Math.abs(top)));
          const neg = val < 0;
          return (
            <div className="perf-row" key={c.channel_id}>
              <span className="perf-rank">{i + 1}</span>
              <div className="perf-main">
                <div className="perf-top">
                  <span className="perf-name">{c.channel}</span>
                  <span className={"perf-val" + (neg ? " neg" : "")}>{active.fmt(c)}</span>
                </div>
                <div className="perf-bar-track">
                  <div
                    className={"perf-bar" + (neg ? " neg" : "")}
                    style={{ width: pct + "%" }}
                  />
                </div>
                <div className="perf-sub">
                  {compact(c.subs)} subs · {compact(c.views)} views · {c.videoCount} videos
                  · 28d {signed(c.subsGained28)} subs
                </div>
              </div>
              <Sparkline values={c.spark} color="var(--info)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
