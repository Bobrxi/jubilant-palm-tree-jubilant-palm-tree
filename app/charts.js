// Hand-rolled SVG charts — zero dependencies, isomorphic (usable from server or
// client components). All inputs are plain arrays of { date, value } or numbers.
import { compact } from "./format";

function pathFrom(points, w, h, pad, min, max) {
  const span = max - min || 1;
  const n = points.length;
  const x = (i) => (n <= 1 ? pad : pad + (i * (w - 2 * pad)) / (n - 1));
  const y = (v) => h - pad - ((v - min) / span) * (h - 2 * pad);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${h - pad} L${x(0).toFixed(1)} ${h - pad} Z`;
  return { line, area, x, y };
}

// Full-width line chart with gradient area fill + min/max/last labels.
export function LineChart({ data, color = "var(--accent)", label, height = 190 }) {
  const w = 640;
  const h = height;
  const pad = 26;
  const pts = (data || []).filter((d) => d && Number.isFinite(Number(d.value)));
  if (pts.length < 2) {
    return (
      <div className="chart-card">
        <div className="chart-head">
          <span className="chart-label">{label}</span>
        </div>
        <div className="chart-empty">Not enough data yet — needs ≥ 2 days.</div>
      </div>
    );
  }
  const vals = pts.map((p) => Number(p.value));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const { line, area } = pathFrom(pts, w, h, pad, min, max);
  const last = vals[vals.length - 1];
  const first = vals[0];
  const id = "g" + Math.abs(hashStr(label || color)).toString(36);
  return (
    <div className="chart-card">
      <div className="chart-head">
        <span className="chart-label">{label}</span>
        <span className="chart-last" style={{ color }}>
          {compact(last)}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="chart-foot">
        <span>{pts[0].date}</span>
        <span className="chart-range">min {compact(min)} · max {compact(max)} · Δ {signedNum(last - first)}</span>
        <span>{pts[pts.length - 1].date}</span>
      </div>
    </div>
  );
}

// Tiny inline sparkline for a list row.
export function Sparkline({ values, color = "var(--accent)", width = 92, height = 26 }) {
  const pts = (values || []).map((v) => ({ value: Number(v) || 0 }));
  if (pts.length < 2) return <svg width={width} height={height} className="spark" />;
  const vals = pts.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const { line } = pathFrom(pts, width, height, 2, min, max);
  return (
    <svg width={width} height={height} className="spark" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function signedNum(v) {
  const s = compact(Math.abs(v));
  return v > 0 ? "+" + s : v < 0 ? "−" + s : s;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
