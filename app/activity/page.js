import { getEvents, isConfigured } from "../../lib/supabase";
import Shell from "../shell";
import Feed from "../feed";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  if (!isConfigured()) {
    return (
      <Shell sub="ACTIVITY">
        <div className="empty">Not configured — set the Supabase env vars.</div>
      </Shell>
    );
  }
  const events = await getEvents(150);
  return (
    <Shell sub="ACTIVITY">
      <div className="section-title">
        <span>Activity</span>
        <span className="section-meta">live operational log · {events.length} events</span>
      </div>
      <Feed events={events} />
    </Shell>
  );
}
