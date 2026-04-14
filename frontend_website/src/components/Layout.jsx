import Navbar from "./Navbar";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const sideLinkStyle = (isActive) => isActive
  ? { background: "rgba(159,204,129,0.15)", color: "#9FCC81", border: "1px solid rgba(159,204,129,0.25)" }
  : { color: "#C7B788" };

const navItems = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/assignments", icon: "📦", label: "Assignments" },
  { to: "/reports", icon: "🧾", label: "Reports" },
  { to: "/flagged", icon: "🚩", label: "Flagged" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="w-full overflow-x-hidden text-white" style={{ background: "linear-gradient(135deg, #1a2a1b 0%, #1e2a2b 50%, #1a2020 100%)", minHeight: "100dvh" }}>
      {/* glow blobs — absolute so they never cause overflow */}
      <div className="pointer-events-none absolute inset-0 opacity-20 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl" style={{ background: "#9FCC81" }} />
        <div className="absolute top-40 -right-24 h-72 w-72 rounded-full blur-3xl" style={{ background: "#66AFB6" }} />
        <div className="absolute bottom-10 left-20 h-72 w-72 rounded-full blur-3xl" style={{ background: "#C7B788" }} />
      </div>

      <div className="relative flex flex-col" style={{ minHeight: "100dvh", zIndex: 1 }}>
        <Navbar />

        <div className="flex flex-1 min-w-0">
          {/* Sidebar — desktop only */}
          <aside className="hidden md:flex md:w-64 md:flex-col shrink-0" style={{ borderRight: "1px solid rgba(199,183,136,0.15)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(199,183,136,0.15)" }}>
              <div className="font-bold text-lg text-white">DriverLog</div>
              <div className="text-xs" style={{ color: "#C7B788" }}>Employer Portal</div>
            </div>
            <nav className="p-3 text-sm">
              <div className="text-xs font-semibold px-3 py-2" style={{ color: "rgba(199,183,136,0.5)" }}>HOME</div>
              {navItems.map(({ to, icon, label }) => (
                <NavLink key={to} to={to}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg transition text-sm font-medium" style={sideLinkStyle(isActive)}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main content — pages render directly, no extra max-w wrapper */}
          <main className="flex-1 min-w-0 overflow-x-hidden px-3 py-5 pb-24 md:px-6 md:py-6 md:pb-8">
            <Outlet />
          </main>
        </div>

        <footer className="hidden md:block text-sm" style={{ borderTop: "1px solid rgba(199,183,136,0.15)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", color: "#C7B788" }}>
          <div className="max-w-6xl mx-auto px-4 py-3">
            © {new Date().getFullYear()} DriverLog
          </div>
        </footer>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{
          background: "rgba(26,42,27,0.97)",
          borderTop: "1px solid rgba(199,183,136,0.2)",
          backdropFilter: "blur(16px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
        }}
      >
        {navItems.map(({ to, icon, label }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
              style={{
                color: isActive ? "#9FCC81" : "rgba(199,183,136,0.6)",
                background: isActive ? "rgba(159,204,129,0.1)" : "transparent",
                minWidth: 60,
              }}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: -1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 24,
                    height: 2,
                    background: "#9FCC81",
                    borderRadius: 2,
                    boxShadow: "0 0 6px #9FCC81",
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}