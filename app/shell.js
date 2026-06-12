import Refresher from "./refresher";
import Controls from "./controls";
import TabNav from "./tabnav";

// Shared chrome for every dashboard page: masthead + tab bar + live refresher.
// Pages render their own content as children.
export default function Shell({ sub = "OPS CONTROL", controls = true, children }) {
  return (
    <div className="wrap">
      <Refresher seconds={15} />
      <header className="masthead">
        <div className="brand">
          <span className="logo">▣</span>
          <div className="brand-text">
            <div className="brand-title">CONTENT FARM</div>
            <div className="brand-sub">// {sub}</div>
          </div>
        </div>
        <div className="masthead-right">
          <div className="live">
            <span className="dot" /> LIVE · 15s
          </div>
          {controls ? <Controls /> : null}
        </div>
      </header>
      <TabNav />
      {children}
    </div>
  );
}
