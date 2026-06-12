// Pure formatting helpers shared by server and client components.

export function timeAgo(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

// Compact number: 1234 → "1.2K", 3_400_000 → "3.4M".
export function compact(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}

// Signed compact for deltas: +1.2K / -340.
export function signed(n) {
  const v = Number(n) || 0;
  return (v > 0 ? "+" : v < 0 ? "−" : "") + compact(Math.abs(v));
}

export function clock(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}
