"use client";
import { useState } from "react";
import { ChartBody } from "./charts";
import { bucket } from "./analytics";
import { compact } from "./format";

const MODES = [
  { key: "day", label: "DAILY" },
  { key: "week", label: "WEEKLY" },
  { key: "month", label: "MONTHLY" },
  { key: "cumulative", label: "ALL-TIME" },
];

// A flow chart (views, watch hours) with a granularity toggle. YouTube only
// exposes daily data, so the finest bucket is DAILY — no hourly exists.
export default function PerfChart({ daily, label, color = "var(--info)", defaultMode = "day" }) {
  const [mode, setMode] = useState(defaultMode);
  const data = bucket(daily, mode);
  const last = data.length ? Number(data[data.length - 1].value) : null;
  return (
    <div className="chart-card">
      <div className="chart-head">
        <span className="chart-label">{label}</span>
        {last != null ? <span className="chart-last" style={{ color }}>{compact(last)}</span> : null}
      </div>
      <div className="granularity">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={"gbtn" + (mode === m.key ? " on" : "")}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ChartBody data={data} color={color} />
    </div>
  );
}
