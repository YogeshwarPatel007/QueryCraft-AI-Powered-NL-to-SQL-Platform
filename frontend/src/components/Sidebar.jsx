import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { logout as logoutApi } from "../api/authApi";
import AlertsPanel from "./AlertsPanel";
import { getAlerts } from "../api/alertApi";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    to: "/query",
    label: "Query Lab",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    to: "/history",
    label: "History",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user) {
      getAlerts().then(res => setUnreadCount(res.data.unreadCount)).catch(() => {});
      const intv = setInterval(() => {
        getAlerts().then(res => setUnreadCount(res.data.unreadCount)).catch(() => {});
      }, 60000);
      return () => clearInterval(intv);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logoutApi();
    setUser(null);
    navigate("/login");
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <aside
      className={`${
        collapsed ? "w-[68px]" : "w-60"
      } bg-ink border-r border-line min-h-screen flex flex-col font-body transition-all duration-300 ease-in-out shrink-0`}
    >
      {/* Brand */}
      <div className="px-4 py-4 border-b border-line flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-[15px] text-text truncate">
              QueryMind
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => { setAlertsOpen(true); setUnreadCount(0); }} 
            className="relative p-1.5 text-muted hover:text-text rounded-md hover:bg-surface transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-muted hover:text-text transition-colors p-1 rounded-md hover:bg-surface"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 mt-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                active
                  ? "bg-accent-light text-accent font-semibold shadow-sm"
                  : "text-muted hover:bg-surface hover:text-text"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className={`shrink-0 ${active ? "text-accent" : ""}`}>{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      {!collapsed && (
        <div className="mx-3 mb-2">
          <div className="bg-gradient-to-r from-accent-light to-surface rounded-xl px-3 py-2.5 border border-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-accent">Free Plan</p>
                <p className="text-[10px] text-muted mt-0.5">100 queries/month</p>
              </div>
              <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-medium">
                Upgrade
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Profile menu */}
      <div className="p-2 border-t border-line relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-surface transition-colors text-left ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
            {initial}
          </span>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate font-medium">{user?.name || "Account"}</p>
                <p className="text-[11px] text-muted truncate">{user?.email || ""}</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </>
          )}
        </button>

        {menuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-ink border border-line rounded-xl shadow-elevation-3 overflow-hidden animate-slideDown">
            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-text hover:bg-surface transition-colors"
            >
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account settings
            </Link>
            <div className="border-t border-line" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-danger hover:bg-danger-light transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Log out
            </button>
          </div>
        )}
      </div>

      <AlertsPanel isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </aside>
  );
}