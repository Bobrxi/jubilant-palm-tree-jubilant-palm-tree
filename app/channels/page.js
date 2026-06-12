import { getChannels, getAnalytics, isConfigured } from "../../lib/supabase";
import Shell from "../shell";
import { aggregate } from "../analytics";
import ChannelGrid from "../channelgrid";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  if (!isConfigured()) {
    return (
      <Shell sub="CHANNELS">
        <div className="empty">Not configured — set the Supabase env vars.</div>
      </Shell>
    );
  }

  const [status, rows] = await Promise.all([getChannels(), getAnalytics()]);
  const a = aggregate(rows);

  // Union ops status + analytics, keyed by channel name.
  const byName = new Map();
  for (const s of status) byName.set(s.channel, { ...s });
  for (const c of a.channels) {
    const cur = byName.get(c.channel) || { channel: c.channel };
    cur.an = c;
    byName.set(c.channel, cur);
  }
  const merged = Array.from(byName.values()).sort((x, y) => {
    const fx = x.fails || 0, fy = y.fails || 0;
    if (fy !== fx) return fy - fx; // failing first
    return (y.an?.views || 0) - (x.an?.views || 0);
  });

  return (
    <Shell sub="CHANNELS">
      <div className="section-title">
        <span>Channels</span>
        <span className="section-meta">{merged.length} tracked · click for full analytics</span>
      </div>
      <ChannelGrid channels={merged} />
    </Shell>
  );
}
