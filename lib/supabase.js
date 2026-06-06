// Server-only Supabase access via the PostgREST REST API.
// Uses the SERVICE key, which must NEVER be exposed to the browser — every
// caller here runs in a Server Component / route handler on Vercel's server.

const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

async function rest(path) {
  if (!BASE || !KEY) return [];
  try {
    const res = await fetch(`${BASE}/rest/v1/${path}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getChannels() {
  return rest("channel_status?select=*&order=updated_at.desc");
}

export async function getEvents(limit = 60) {
  return rest(`events?select=*&order=ts.desc&limit=${limit}`);
}

export function isConfigured() {
  return Boolean(BASE && KEY);
}
