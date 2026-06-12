"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Performance", icon: "◈", match: (p) => p === "/" },
  { href: "/channels", label: "Channels", icon: "▦", match: (p) => p.startsWith("/channel") },
  { href: "/activity", label: "Activity", icon: "≡", match: (p) => p === "/activity" },
];

// Tactical segmented tab bar. The sliding underline tracks the active route.
export default function TabNav() {
  const path = usePathname();
  return (
    <nav className="tabnav">
      {TABS.map((t) => {
        const on = t.match(path);
        return (
          <Link key={t.href} href={t.href} className={"tab" + (on ? " on" : "")}>
            <span className="tab-icon">{t.icon}</span>
            {t.label}
            {on ? <span className="tab-glow" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
