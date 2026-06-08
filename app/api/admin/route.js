import { adminAction } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

// POST { action: "reset_all" | "clear_events" | "reset_channel" | "dismiss_fails",
//        channel?: string }
// Protected by the same password middleware as the rest of the dashboard.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { action, channel } = body || {};
  const result = await adminAction(action, channel);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
