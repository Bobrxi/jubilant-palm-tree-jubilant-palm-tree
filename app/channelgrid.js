import Link from "next/link";
import { compact, signed, timeAgo } from "./format";
import { Sparkline } from "./charts";

// Analytics-rich, clickable channel cards. Each links to its detail page.
// `channels` are pre-merged: ops status (uploads/fails/last_*) + analytics (an).
export default function ChannelGrid({ channels }) {
  if (!channels || channels.length === 0) {
    return (
      <div className="empty">
        No channels yet. Run the pipeline + <b>📊 Sync analytics → cloud</b> on your laptop.
      </div>
    );
  }
  return (
    <div className="grid">
      {channels.map((c, i) => {
        const an = c.an || {};
        const bad = (c.fails || 0) > 0;
        return (
          <Link
            key={c.channel}
            href={`/channel/${encodeURIComponent(c.channel)}`}
            className={"card chan-card" + (bad ? " bad" : "")}
            style={{ animationDelay: `${Math.min(i * 40, 360)}ms` }}
          >
            <span className="rail" />
            <div className="ch">
              <span className="ch-name">{c.channel}</span>
              <span className={"badge " + (bad ? "bad" : "ok")}>
                {bad ? `${c.fails} FAIL${c.fails > 1 ? "S" : ""}` : "OK"}
              </span>
            </div>

            <div className="chan-hero">
              <div className="chan-hero-figs">
                <div className="chan-fig">
                  <span className="chan-fig-n">{compact(an.subs || 0)}</span>
                  <span className="chan-fig-l">subs</span>
                </div>
                <div className="chan-fig">
                  <span className="chan-fig-n">{compact(an.views || 0)}</span>
                  <span className="chan-fig-l">views</span>
                </div>
              </div>
              <Sparkline values={an.spark} color="var(--info)" width={84} height={34} />
            </div>

            <div className="row">
              <span className="k">7-day views</span>
              <span className="v">{signed(an.views7 || 0)}</span>
            </div>
            <div className="row">
              <span className="k">uploads</span>
              <span className="v">{(c.uploads || 0).toLocaleString()}</span>
            </div>
            <div className="row">
              <span className="k">last event</span>
              <span className="v">{timeAgo(c.last_event)}</span>
            </div>

            <div className="chan-go">view full analytics →</div>
          </Link>
        );
      })}
    </div>
  );
}
