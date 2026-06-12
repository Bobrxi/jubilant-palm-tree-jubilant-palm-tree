// Server-only Supabase access via the PostgREST REST API.
// Uses the SERVICE key, which must NEVER be exposed to the browser — every
// caller here runs in a Server Component / route handler on Vercel's server.

const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

function headers(extra) {
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, ...(extra || {}) };
}

async function rest(path) {
  if (!BASE || !KEY) return [];
  try {
    const res = await fetch(`${BASE}/rest/v1/${path}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Exact row count via the Content-Range header (PostgREST `count=exact`).
async function restCount(path) {
  if (!BASE || !KEY) return 0;
  try {
    const res = await fetch(`${BASE}/rest/v1/${path}`, {
      method: "HEAD",
      headers: headers({ Prefer: "count=exact", Range: "0-0" }),
      cache: "no-store",
    });
    const cr = res.headers.get("content-range"); // "0-0/123" or "*/0"
    if (!cr) return 0;
    const total = cr.split("/").pop();
    return total === "*" ? 0 : parseInt(total, 10) || 0;
  } catch {
    return 0;
  }
}

async function restMutate(method, path, body) {
  if (!BASE || !KEY) return { ok: false, error: "Supabase not configured" };
  try {
    const res = await fetch(`${BASE}/rest/v1/${path}`, {
      method,
      headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, error: `${res.status} ${txt}`.trim() };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function getChannels() {
  return rest("channel_status?select=*&order=updated_at.desc");
}

export async function getEvents(limit = 60) {
  return rest(`events?select=*&order=ts.desc&limit=${limit}`);
}

// Channel-level daily analytics rows (subs/views totals + daily metrics).
// Returns [] when the table doesn't exist yet, so the UI degrades gracefully.
export async function getAnalytics() {
  return rest("channel_analytics?select=*&order=date.asc");
}

// Aggregate stats from the events log: lifetime ok/fail counts (for success
// rate) and uploads in the last 24h. Falls back gracefully if events are pruned.
export async function getStats() {
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const [ok, fail, uploads24] = await Promise.all([
    restCount("events?kind=eq.upload_ok"),
    restCount("events?kind=eq.upload_fail"),
    restCount(`events?kind=eq.upload_ok&ts=gte.${encodeURIComponent(since)}`),
  ]);
  const denom = ok + fail;
  return {
    uploadsOk: ok,
    uploadsFail: fail,
    uploads24,
    successRate: denom ? Math.round((100 * ok) / denom) : null,
  };
}

// ── Admin mutations (DELETE / PATCH). Run server-side behind the password gate.
// PostgREST requires a filter on every delete, so "all" uses an always-true one.
export async function adminAction(action, channel) {
  const ch = channel ? encodeURIComponent(channel) : "";
  switch (action) {
    case "reset_all": {
      const a = await restMutate("DELETE", "events?id=gte.0");
      const b = await restMutate("DELETE", "channel_status?updated_at=gte.1970-01-01");
      return a.ok ? b : a;
    }
    case "clear_events":
      return restMutate("DELETE", "events?id=gte.0");
    case "reset_channel": {
      if (!channel) return { ok: false, error: "no channel" };
      const a = await restMutate("DELETE", `events?channel=eq.${ch}`);
      const b = await restMutate("DELETE", `channel_status?channel=eq.${ch}`);
      return a.ok ? b : a;
    }
    case "dismiss_fails": {
      if (!channel) return { ok: false, error: "no channel" };
      return restMutate("PATCH", `channel_status?channel=eq.${ch}`, {
        fails: 0,
        last_error: null,
      });
    }
    default:
      return { ok: false, error: `unknown action: ${action}` };
  }
}

export function isConfigured() {
  return Boolean(BASE && KEY);
}
