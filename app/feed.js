"use client";
import { useMemo, useState } from "react";
import { clock } from "./format";

const LEVELS = [
  { key: "all", label: "ALL" },
  { key: "err", label: "ERRORS" },
  { key: "warn", label: "WARN" },
  { key: "ok", label: "OK" },
];

// Activity feed with client-side filters: level, channel, and free-text search.
export default function Feed({ events }) {
  const [level, setLevel] = useState("all");
  const [channel, setChannel] = useState("all");
  const [q, setQ] = useState("");

  const channels = useMemo(() => {
    const set = new Set();
    (events || []).forEach((e) => e.channel && set.add(e.channel));
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (events || []).filter((e) => {
      if (level !== "all" && (e.level || "info") !== level) return false;
      if (channel !== "all" && (e.channel || "") !== channel) return false;
      if (needle && !((e.msg || "") + " " + (e.channel || "")).toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [events, level, channel, q]);

  return (
    <div>
      <div className="feed-bar">
        <div className="seg">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              className={"seg-btn" + (level === l.key ? " on" : "")}
              onClick={() => setLevel(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <select
          className="sel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="all">all channels</option>
          {channels.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="search"
          placeholder="search log…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="feed-count">
          {filtered.length}/{(events || []).length}
        </span>
      </div>

      <div className="feed">
        {filtered.length === 0 ? (
          <div className="empty">No matching events.</div>
        ) : (
          filtered.map((e, i) => (
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
