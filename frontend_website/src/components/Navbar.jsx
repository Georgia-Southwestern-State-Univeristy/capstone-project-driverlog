import { getEmail, logout } from "../auth/authService";

export default function Navbar() {
  const email = getEmail();
  const shortEmail = email ? email.split("@")[0] : "";

  return (
    <header
      style={{
        borderBottom: "1px solid rgba(199,183,136,0.2)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 py-3">
        {/* ALWAYS row (no stacking) */}
        <div className="flex items-center justify-between gap-3">

          {/* LEFT: Logo + Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl text-white font-bold shadow text-sm"
              style={{ background: "linear-gradient(135deg, #9FCC81, #66AFB6)" }}
            >
              D
            </div>

            <div className="leading-tight min-w-0">
              <div className="text-white font-semibold text-sm sm:text-base truncate">
                DriverLog
              </div>
              <div
                className="text-[10px] sm:text-xs truncate"
                style={{ color: "#C7B788" }}
              >
                Employer Portal
              </div>
            </div>
          </div>

          {/* RIGHT: Signed in + Logout */}
          <div className="flex items-center gap-2 min-w-0">

            {email && (
              <div
                className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[220px] text-right"
                style={{ color: "#C7B788" }}
                title={email}
              >
                <span className="hidden sm:inline">
                  Signed in as:{" "}
                </span>

                <span className="font-semibold text-white">
                  {shortEmail}
                </span>
              </div>
            )}

            <button
              onClick={logout}
              className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition"
              style={{
                background: "rgba(199,183,136,0.12)",
                border: "1px solid rgba(199,183,136,0.3)",
                color: "#C7B788",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(199,183,136,0.2)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(199,183,136,0.12)")
              }
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}