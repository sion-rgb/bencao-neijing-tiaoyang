import { BookOpenText, Home, Info, Leaf, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { APP_CONFIG, SHORT_DISCLAIMER } from "../config/app";

const navItems = [
  { to: "/", label: "首頁", icon: Home },
  { to: "/classics", label: "經典", icon: BookOpenText },
  { to: "/guidelines", label: "須知", icon: Info },
  { to: "/privacy", label: "私隱", icon: LockKeyhole }
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const minimal = location.pathname === "/emergency";
  return (
    <div className="app-shell">
      {!minimal && (
        <header className="site-header">
          <Link className="brand" to="/" aria-label={`${APP_CONFIG.name}首頁`}>
            <span className="brand-mark" aria-hidden="true"><Leaf size={20} /></span>
            <span><strong>{APP_CONFIG.name}</strong><small>{APP_CONFIG.subtitle}</small></span>
          </Link>
          <nav className="desktop-nav" aria-label="主要導覽">
            {navItems.map(({ to, label }) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
        </header>
      )}
      <main id="main-content" className={minimal ? "emergency-main" : "main-content"}>{children}</main>
      {!minimal && (
        <>
          <footer className="site-footer">
            <p>{SHORT_DISCLAIMER}</p>
            <p>版本 {APP_CONFIG.version} ・ 最後更新：{APP_CONFIG.lastUpdated}</p>
          </footer>
          <nav className="mobile-nav" aria-label="流動版主要導覽">
            {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}
          </nav>
        </>
      )}
    </div>
  );
}
