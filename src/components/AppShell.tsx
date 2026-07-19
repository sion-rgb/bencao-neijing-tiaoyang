import { BookOpenText, Home, Info, Leaf, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { APP_CONFIG, SHORT_DISCLAIMER } from "../config/app";
import { useAppState } from "../state/AppState";
import { MIGRATION_NOTICE } from "../utils/storage";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";

const navItems = [
  { to: "/", label: "首頁", icon: Home },
  { to: "/classics", label: "經典", icon: BookOpenText },
  { to: "/guidelines", label: "須知", icon: Info },
  { to: "/privacy", label: "私隱", icon: LockKeyhole }
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { migrationNotice, dismissMigration } = useAppState();
  const minimal = location.pathname === "/emergency";
  return (
    <div className="app-shell">
      <PwaUpdatePrompt />
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
      <main id="main-content" className={minimal ? "emergency-main" : "main-content"}>
        {migrationNotice && <div className="notice warning migration-notice" role="status"><p>{MIGRATION_NOTICE}</p><button type="button" className="button ghost" onClick={dismissMigration}>知道了</button></div>}
        {children}
      </main>
      {!minimal && (
        <>
          <footer className="site-footer">
            <div><p>{SHORT_DISCLAIMER}</p><p className="footer-links"><a href="https://github.com/sion-rgb/bencao-neijing-tiaoyang" target="_blank" rel="noreferrer">GitHub原始碼</a><a href="https://sion-rgb.github.io/bencao-neijing-tiaoyang/" target="_blank" rel="noreferrer">線上版本</a><Link to="/guidelines">免責聲明</Link><Link to="/privacy">私隱說明</Link></p></div>
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
