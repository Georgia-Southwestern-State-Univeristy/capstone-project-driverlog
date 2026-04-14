import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  getSummaries,
  getRoutes,
  getAssignments,
  getFlaggedEntries,
  createAssignment,
  getMe,
} from "../api/driverlogApi";

function startOfTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isTodayLocal(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const startToday = startOfTodayLocal();
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);
  return d >= startToday && d < startTomorrow;
}

function formatDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSelectedDateRange(selectedDateStr, mode) {
  const base = selectedDateStr ? new Date(`${selectedDateStr}T00:00:00`) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);

  if (mode === "day") {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return { start: weekStart, end: weekEnd };
}

function formatRangeLabel(selectedDateStr, mode) {
  const { start, end } = getSelectedDateRange(selectedDateStr, mode);

  if (mode === "day") {
    return start.toLocaleDateString();
  }

  const endDisplay = new Date(end);
  endDisplay.setDate(endDisplay.getDate() - 1);

  return `${start.toLocaleDateString()} - ${endDisplay.toLocaleDateString()}`;
}

function formatTime(date) {
  if (!date || isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMins = Math.floor((now - date) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  return date.toLocaleDateString();
}

function StatCard({ label, value, badge, icon = "📊" }) {
  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid #C7B788" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm" style={{ color: "#C7B788" }}>
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xl">{icon}</span>
          {badge && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(159,204,129,0.15)",
                color: "#9FCC81",
                border: "1px solid rgba(159,204,129,0.3)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-1 w-2/3 rounded-full" style={{ background: "#9FCC81", opacity: 0.5 }} />
      </div>
      <p className="mt-2 text-xs" style={{ color: "#C7B788" }}>
        Updated just now
      </p>
    </div>
  );
}

function formatDurationMinutes(seconds) {
  const mins = Math.round((Number(seconds) || 0) / 60);
  return `${mins} min`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [routesStatus, setRoutesStatus] = useState("Loading routes...");
  const [routesError, setRoutesError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsStatus, setAssignmentsStatus] = useState("Loading assignments...");
  const [assignmentsError, setAssignmentsError] = useState(null);
  const [summariesStatus, setSummariesStatus] = useState("Loading summaries...");
  const [summariesError, setSummariesError] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [flaggedStatus, setFlaggedStatus] = useState("Loading flagged...");
  const [flaggedError, setFlaggedError] = useState(null);
  const [me, setMe] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDriverId, setFormDriverId] = useState("");
  const [formPriority, setFormPriority] = useState("Normal");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSaving, setFormSaving] = useState(false);

  const [showAllActivity, setShowAllActivity] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const driverMapInstanceRef = useRef(null);
  const routePolylineCacheRef = useRef({});
  const [driverMapMode, setDriverMapMode] = useState("day");
  const [driverSelectedDate, setDriverSelectedDate] = useState(formatDateInputValue());
  const [driverMapFullscreen, setDriverMapFullscreen] = useState(false);
  const [showRouteHistory, setShowRouteHistory] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadMe() {
      try {
        const data = await getMe();
        if (!alive) return;
        setMe(data);
      } catch {
        // non-critical
      }
    }

    async function loadSummaries() {
      try {
        setSummariesError(null);
        const data = await getSummaries();
        if (!alive) return;
        setSummaries(Array.isArray(data) ? data : []);
        setSummariesStatus("Connected");
      } catch (error) {
        if (!alive) return;
        setSummariesStatus("Not connected");
        setSummariesError(error.message);
        setSummaries([]);
      }
    }

    async function loadRoutes() {
      try {
        setRoutesError(null);
        const data = await getRoutes();
        if (!alive) return;
        if (data && Array.isArray(data.activeDrivers)) {
          setRoutes(data.activeDrivers.map((id) => ({ userId: id })));
          setRoutesStatus("Connected");
          return;
        }
        setRoutes(Array.isArray(data) ? data : []);
        setRoutesStatus("Connected");
      } catch (error) {
        if (!alive) return;
        setRoutes([]);
        setRoutesStatus("Not connected");
        setRoutesError(error.message);
      }
    }

    async function loadAssignments() {
      try {
        setAssignmentsError(null);
        const data = await getAssignments();
        if (!alive) return;
        setAssignments(Array.isArray(data) ? data : []);
        setAssignmentsStatus("Connected");
      } catch (error) {
        if (!alive) return;
        setAssignments([]);
        setAssignmentsStatus("Not connected");
        setAssignmentsError(error.message);
      }
    }

    async function loadFlagged() {
      try {
        setFlaggedError(null);
        const data = await getFlaggedEntries();
        if (!alive) return;
        setFlagged(Array.isArray(data) ? data : []);
        setFlaggedStatus("Connected");
      } catch (error) {
        if (!alive) return;
        setFlagged([]);
        setFlaggedStatus("Connected");
        setFlaggedError(null);
      }
    }

    loadMe();
    loadSummaries();
    loadRoutes();
    loadAssignments();
    loadFlagged();

    return () => {
      alive = false;
    };
  }, []);

  const activeDriversCount = new Set(routes.map((r) => r.userId).filter(Boolean)).size;
  const reportsTodayCount = summaries.filter((s) => isTodayLocal(s.completedAt)).length;
  const openAssignmentsCount = assignments.filter(
    (a) => String(a.status || "").toLowerCase() === "open"
  ).length;
  const openFlaggedCount = flagged.filter((f) => f.status !== "Resolved").length;

  const driverLeaderboard = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - now.getDay());

    const map = new Map();

    for (const s of summaries) {
      if (!s.completedAt || new Date(s.completedAt) < weekStart) continue;
      const key = s.username || s.userEmail || s.email || s.userId || "Unknown";
      const miles = Number(s.totalDistanceMiles) || 0;
      const routesCount = 1;

      if (!map.has(key)) {
        map.set(key, { name: key, miles: 0, routes: 0 });
      }

      const d = map.get(key);
      d.miles += miles;
      d.routes += routesCount;
    }

    return [...map.values()].sort((a, b) => b.miles - a.miles).slice(0, 5);
  }, [summaries]);

  const flagBreakdown = useMemo(() => {
    const open = flagged.filter((f) => f.status !== "Resolved");
    return {
      high: open.filter((f) => f.severity === "High").length,
      medium: open.filter((f) => f.severity === "Medium").length,
      low: open.filter((f) => f.severity === "Low").length,
    };
  }, [flagged]);

  const cards = [
    {
      label: "Active Drivers",
      value: routesStatus === "Loading routes..." ? "—" : String(activeDriversCount),
      badge: routesStatus === "Connected" ? "Live" : routesStatus,
      icon: "🚚",
    },
    {
      label: "Open Assignments",
      value: assignmentsStatus === "Loading assignments..." ? "—" : String(openAssignmentsCount),
      badge: assignmentsStatus === "Connected" ? "Live" : assignmentsStatus,
      icon: "📦",
    },
    {
      label: "Reports Today",
      value: summariesStatus === "Loading summaries..." ? "—" : String(reportsTodayCount),
      badge: summariesStatus === "Connected" ? "Updated" : summariesStatus,
      icon: "🧾",
    },
    {
      label: "Flagged Entries",
      value: flaggedStatus === "Loading flagged..." ? "—" : String(openFlaggedCount),
      badge: flaggedStatus === "Connected" ? "Needs review" : flaggedStatus,
      icon: "🚩",
    },
  ];

  const allActivity = useMemo(() => {
    const assignmentItems = assignments.map((a) => ({
      type: "assignment",
      icon: "📦",
      text: `Assignment created: "${a.title || "Untitled"}"`,
      time: new Date(a.createdAt || a.updatedAt || Date.now()),
    }));

    const reportItems = summaries.map((s) => ({
      type: "report",
      icon: "🧾",
      text: `Report received: ${
        s.userName || s.userEmail || s.username || s.email || s.userId || "Driver"
      }`,
      time: new Date(s.completedAt || s.createdAt || Date.now()),
    }));

    const flaggedItems = flagged.map((f) => ({
      type: "flag",
      icon: "🚩",
      text: `Flag raised: ${f.reason || "Flagged activity"} — ${
        f.driverEmail || f.driverId || "Unknown driver"
      }`,
      time: new Date(f.createdAt || Date.now()),
    }));

    return [...assignmentItems, ...reportItems, ...flaggedItems]
      .filter((x) => x.time && !isNaN(x.time.getTime()))
      .sort((a, b) => b.time - a.time);
  }, [assignments, summaries, flagged]);

  const activity = showAllActivity ? allActivity : allActivity.slice(0, 6);

  const isCreator = me?.role === "Admin" || me?.role === "Manager";
  const isDriver = me?.role === "Driver";

  const driverSelectedSummaries = useMemo(() => {
    if (!isDriver) return [];

    const { start, end } = getSelectedDateRange(driverSelectedDate, driverMapMode);

    return summaries
      .filter((s) => {
        if (!s.completedAt) return false;
        const d = new Date(s.completedAt);
        return d >= start && d < end;
      })
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }, [isDriver, summaries, driverSelectedDate, driverMapMode]);

  useEffect(() => {
    if (!selectedRouteId) return;

    const stillVisible = driverSelectedSummaries.some(
      (route) => (route.routeId || route.id) === selectedRouteId
    );

    if (!stillVisible) {
      setSelectedRouteId(null);
    }
  }, [driverSelectedSummaries, selectedRouteId]);

  async function handleRefresh() {
    try {
      setIsRefreshing(true);
      setSummariesStatus("Loading summaries...");
      setRoutesStatus("Loading routes...");
      setAssignmentsStatus("Loading assignments...");
      setFlaggedStatus("Loading flagged...");

      const [summariesData, routesData, assignmentsData, flaggedData] = await Promise.all([
        getSummaries(),
        getRoutes(),
        getAssignments(),
        getFlaggedEntries(),
      ]);

      setSummaries(Array.isArray(summariesData) ? summariesData : []);
      setSummariesStatus("Connected");
      setSummariesError(null);

      if (routesData && Array.isArray(routesData.activeDrivers)) {
        setRoutes(routesData.activeDrivers.map((id) => ({ userId: id })));
      } else {
        setRoutes(Array.isArray(routesData) ? routesData : []);
      }
      setRoutesStatus("Connected");
      setRoutesError(null);

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setAssignmentsStatus("Connected");
      setAssignmentsError(null);

      setFlagged(Array.isArray(flaggedData) ? flaggedData : []);
      setFlaggedStatus("Connected");
      setFlaggedError(null);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleExport() {
    const rows = [
      ["Metric", "Value", "As of"],
      ["Active Drivers", activeDriversCount, new Date().toLocaleString()],
      ["Open Assignments", openAssignmentsCount, new Date().toLocaleString()],
      ["Reports Today", reportsTodayCount, new Date().toLocaleString()],
      ["Open Flagged Entries", openFlaggedCount, new Date().toLocaleString()],
      [],
      ["Recent Activity", "", ""],
      ...activity.map((a) => [a.text, "", formatTime(a.time)]),
    ];

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) return setFormError("Title is required");
    if (!formDriverId.trim()) return setFormError("Driver ID or email is required");

    setFormSaving(true);

    try {
      await createAssignment({
        title: formTitle.trim(),
        driverId: formDriverId.trim(),
        priority: formPriority,
        notes: formNotes.trim(),
      });

      setShowModal(false);
      setFormTitle("");
      setFormDriverId("");
      setFormPriority("Normal");
      setFormNotes("");

      const data = await getAssignments();
      setAssignments(Array.isArray(data) ? data : []);
      setAssignmentsStatus("Connected");
      setAssignmentsError(null);
    } catch (err) {
      setFormError(err?.message || "Failed to create assignment");
    } finally {
      setFormSaving(false);
    }
  }

  useEffect(() => {
    if (!isDriver) return;
    if (!window.atlas) return;

    const filtered = driverSelectedSummaries;

    if (driverMapInstanceRef.current) {
      driverMapInstanceRef.current.dispose();
      driverMapInstanceRef.current = null;
    }

    if (filtered.length === 0) return;

    let isCancelled = false;

    const timer = setTimeout(async () => {
      const el = document.getElementById("driver-route-map");
      if (!el || isCancelled) return;

      const map = new window.atlas.Map("driver-route-map", {
        authOptions: {
          authType: "subscriptionKey",
          subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY,
        },
        style: "road",
        language: "en-US",
        renderWorldCopies: false,
      });

      driverMapInstanceRef.current = map;

      map.events.add("ready", async () => {
        if (isCancelled) return;

        let token = null;

        try {
          const { getAccessToken } = await import("../auth/token");
          token = await getAccessToken();
        } catch {
          return;
        }

        if (!token || isCancelled) return;

        async function getPolylineCoords(routeId) {
          if (routePolylineCacheRef.current[routeId]) {
            return routePolylineCacheRef.current[routeId];
          }

          const res = await fetch(
            `https://driverlogbackend-cwe7gpeuamfhffgt.eastus-01.azurewebsites.net/api/routes/${routeId}/polyline`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!res.ok) return [];

          const data = await res.json();
          const coords = (data?.geometry?.coordinates || []).filter(
            (c) =>
              Array.isArray(c) &&
              typeof c[0] === "number" &&
              typeof c[1] === "number" &&
              !isNaN(c[0]) &&
              !isNaN(c[1])
          );

          routePolylineCacheRef.current[routeId] = coords;
          return coords;
        }

        const allCoords = [];
        const selectedCoords = [];
        const colors = ["#0078FF", "#9FCC81", "#f87171", "#66AFB6", "#fbbf24"];

        await Promise.all(
          filtered.map(async (s, idx) => {
            try {
              const routeId = s.routeId || s.id;
              const coords = await getPolylineCoords(routeId);

              if (coords.length < 2 || isCancelled) return;

              const isSelected = selectedRouteId === routeId;
              allCoords.push(...coords);
              if (isSelected) {
                selectedCoords.push(...coords);
              }

              const ds = new window.atlas.source.DataSource();
              map.sources.add(ds);
              ds.add(new window.atlas.data.Feature(new window.atlas.data.LineString(coords)));

              map.layers.add(
                new window.atlas.layer.LineLayer(ds, null, {
                  strokeColor: isSelected ? "#fbbf24" : colors[idx % colors.length],
                  strokeWidth: isSelected ? 6 : 3,
                  strokeOpacity: isSelected ? 1 : 0.55,
                  lineCap: "round",
                  lineJoin: "round",
                })
              );

              map.markers.add(
                new window.atlas.HtmlMarker({
                  position: coords[0],
                  htmlContent: `<div style="background:${isSelected ? "#fbbf24" : "#9FCC81"};color:#1a2a1b;border-radius:50%;width:${isSelected ? 20 : 18}px;height:${isSelected ? 20 : 18}px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;border:2px solid white;box-shadow:${isSelected ? "0 0 10px rgba(251,191,36,0.8)" : "none"}">S</div>`,
                })
              );

              map.markers.add(
                new window.atlas.HtmlMarker({
                  position: coords[coords.length - 1],
                  htmlContent: `<div style="background:${isSelected ? "#fbbf24" : "#f87171"};color:white;border-radius:50%;width:${isSelected ? 20 : 18}px;height:${isSelected ? 20 : 18}px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;border:2px solid white;box-shadow:${isSelected ? "0 0 10px rgba(251,191,36,0.8)" : "none"}">E</div>`,
                })
              );
            } catch {
              // skip bad route
            }
          })
        );

        if (isCancelled) return;

        const focusCoords = selectedCoords.length > 0 ? selectedCoords : allCoords;
        const validCoords = focusCoords.filter(
          (c) => Array.isArray(c) && !isNaN(c[0]) && !isNaN(c[1])
        );

        if (validCoords.length > 0) {
          const lons = validCoords.map((c) => c[0]);
          const lats = validCoords.map((c) => c[1]);
          const spread = Math.max(
            Math.max(...lons) - Math.min(...lons),
            Math.max(...lats) - Math.min(...lats)
          );

          if (spread < 0.0001) {
            map.setCamera({ center: validCoords[0], zoom: selectedCoords.length > 0 ? 15 : 14 });
          } else {
            map.setCamera({
              bounds: [
                Math.min(...lons),
                Math.min(...lats),
                Math.max(...lons),
                Math.max(...lats),
              ],
              padding: selectedCoords.length > 0 ? 70 : 40,
            });
          }

          map.resize();
        }
      });
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);

      if (driverMapInstanceRef.current) {
        driverMapInstanceRef.current.dispose();
        driverMapInstanceRef.current = null;
      }
    };
  }, [isDriver, driverSelectedSummaries, driverMapMode, driverSelectedDate, selectedRouteId]);

  const inputStyle = {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(199,183,136,0.3)",
    color: "white",
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 shadow-xl space-y-4"
            style={{ background: "#1e2a2b", border: "1px solid rgba(199,183,136,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-bold text-white">New Assignment</h2>
              <p className="text-sm mt-0.5" style={{ color: "#C7B788" }}>
                Create an assignment for a driver.
              </p>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold" style={{ color: "#C7B788" }}>
                  Title *
                </label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Deliver supplies"
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm placeholder:text-white/30 outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: "#C7B788" }}>
                  Driver ID or Email *
                </label>
                <input
                  value={formDriverId}
                  onChange={(e) => setFormDriverId(e.target.value)}
                  placeholder="driverUserId or driver@domain.com"
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm placeholder:text-white/30 outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: "#C7B788" }}>
                  Priority
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  <option style={{ background: "#1e2a2b" }}>Normal</option>
                  <option style={{ background: "#1e2a2b" }}>High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: "#C7B788" }}>
                  Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add directions or instructions..."
                  rows={3}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm placeholder:text-white/30 outline-none"
                  style={inputStyle}
                />
              </div>

              {formError && <p className="text-sm text-rose-300">{formError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(199,183,136,0.3)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "#66AFB6" }}
                >
                  {formSaving ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        className="-mx-3 md:-mx-6 -mt-5 md:-mt-6 px-3 md:px-6 py-4 flex flex-wrap items-center justify-between gap-2"
        style={{
          borderBottom: "1px solid rgba(199,183,136,0.2)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm" style={{ color: "#C7B788" }}>
            Live Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(199,183,136,0.3)",
            }}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={handleExport}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(199,183,136,0.3)",
            }}
          >
            Export
          </button>

          {isCreator && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
              style={{ background: "#66AFB6" }}
            >
              + New
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {(summariesError || routesError || assignmentsError || flaggedError) && (
          <div
            className="rounded-2xl p-4"
            style={{
              border: "1px solid rgba(199,100,100,0.3)",
              background: "rgba(199,100,100,0.1)",
            }}
          >
            <p className="text-sm font-semibold text-rose-200">Some data could not be loaded.</p>
            <div className="mt-2 space-y-1 text-sm text-rose-200/90">
              {summariesError && <div>Summaries: {summariesError}</div>}
              {routesError && <div>Routes: {routesError}</div>}
              {assignmentsError && <div>Assignments: {assignmentsError}</div>}
              {flaggedError && <div>Flagged: {flaggedError}</div>}
            </div>
          </div>
        )}

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              badge={item.badge}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div
            className="lg:col-span-2 rounded-2xl shadow-sm overflow-hidden flex flex-col"
            style={{
              border: "1px solid rgba(199,183,136,0.2)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="p-4 sm:p-6 flex-1">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-white">Operations Snapshot</h2>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto"
                  style={{
                    background: "rgba(102,175,182,0.15)",
                    color: "#66AFB6",
                    border: "1px solid rgba(102,175,182,0.3)",
                  }}
                >
                  This Week
                </span>
              </div>

              <p className="mt-2 text-sm" style={{ color: "#C7B788" }}>
                Quick overview of what's happening across drivers, assignments, and reports.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(199,183,136,0.15)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#C7B788" }}>
                    Most urgent
                  </p>
                  <p className="mt-1 font-semibold text-white">Review flagged entries</p>
                  <p className="mt-1 text-sm" style={{ color: "#C7B788" }}>
                    {cards[3].value} entries waiting for review.
                  </p>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(199,183,136,0.15)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#C7B788" }}>
                    Work not started
                  </p>
                  <p className="mt-1 font-semibold text-white">Open assignments</p>
                  <p className="mt-1 text-sm" style={{ color: "#C7B788" }}>
                    {cards[1].value} assignments currently open.
                  </p>
                </div>
              </div>

              <div
                className="mt-4 rounded-xl p-4"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(199,183,136,0.15)",
                }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: "#C7B788" }}>
                  Open Flags by Severity
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      label: "High",
                      count: flagBreakdown.high,
                      color: "#f87171",
                      track: "rgba(200,60,60,0.15)",
                    },
                    {
                      label: "Medium",
                      count: flagBreakdown.medium,
                      color: "#C7B788",
                      track: "rgba(199,183,136,0.15)",
                    },
                    {
                      label: "Low",
                      count: flagBreakdown.low,
                      color: "#9FCC81",
                      track: "rgba(159,204,129,0.15)",
                    },
                  ].map((f) => {
                    const total = flagBreakdown.high + flagBreakdown.medium + flagBreakdown.low;
                    const pct = total > 0 ? (f.count / total) * 100 : 0;

                    return (
                      <div key={f.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: f.color }}>
                            {f.label}
                          </span>
                          <span className="text-xs font-bold" style={{ color: f.color }}>
                            {f.count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: f.track }}>
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: f.color,
                              transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                              boxShadow: `0 0 8px ${f.color}80`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {isCreator && (
                <div
                  className="mt-4 rounded-xl p-4"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(199,183,136,0.15)",
                  }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: "#C7B788" }}>
                    🏆 Top Drivers This Week
                  </p>

                  {driverLeaderboard.length === 0 ? (
                    <p className="text-xs" style={{ color: "#C7B788" }}>
                      No routes completed this week yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {driverLeaderboard.map((d, i) => {
                        const maxMiles = driverLeaderboard[0].miles || 1;
                        const pct = (d.miles / maxMiles) * 100;
                        const medal =
                          i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                        const barColor =
                          i === 0
                            ? "#9FCC81"
                            : i === 1
                            ? "#66AFB6"
                            : i === 2
                            ? "#C7B788"
                            : "rgba(199,183,136,0.4)";

                        return (
                          <div key={d.name}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs w-6 shrink-0">{medal}</span>
                              <span className="text-xs text-white truncate flex-1">{d.name}</span>
                              <span
                                className="text-xs font-semibold shrink-0"
                                style={{ color: "#9FCC81" }}
                              >
                                {d.miles.toFixed(1)} mi
                              </span>
                            </div>

                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.07)" }}
                            >
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: barColor,
                                  transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s`,
                                  boxShadow: i === 0 ? `0 0 6px ${barColor}80` : "none",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {isDriver && (
                <>
                  <div
                    className="mt-4 rounded-xl overflow-hidden"
                    style={{
                      border: "1px solid rgba(199,183,136,0.15)",
                      ...(driverMapFullscreen
                        ? {
                            position: "fixed",
                            inset: 0,
                            zIndex: 50,
                            margin: 0,
                            borderRadius: 0,
                            background: "#1e2a2b",
                            display: "flex",
                            flexDirection: "column",
                          }
                        : {}),
                    }}
                  >
                    <div
                      className="px-4 py-2 flex items-center justify-between"
                      style={{ background: "rgba(0,0,0,0.3)" }}
                    >
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#C7B788" }}>
                          🗺️ My Routes
                        </p>
                        <p className="text-[11px]" style={{ color: "#C7B788" }}>
                          {driverMapMode === "day" ? "Showing routes for " : "Showing routes for week of "}
                          {formatRangeLabel(driverSelectedDate, driverMapMode)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <div className="flex items-center gap-1">
                          {["day", "week"].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setDriverMapMode(mode);
                                setSelectedRouteId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{
                                background:
                                  driverMapMode === mode
                                    ? "#66AFB6"
                                    : "rgba(102,175,182,0.1)",
                                color: driverMapMode === mode ? "white" : "#66AFB6",
                                border: `1px solid ${
                                  driverMapMode === mode ? "#66AFB6" : "rgba(102,175,182,0.3)"
                                }`,
                              }}
                            >
                              {mode === "day" ? "Day" : "Week"}
                            </button>
                          ))}
                        </div>

                        <input
                          type="date"
                          value={driverSelectedDate}
                          onChange={(e) => {
                            setDriverSelectedDate(e.target.value);
                            setSelectedRouteId(null);
                          }}
                          className="rounded-lg px-2.5 py-1 text-xs outline-none"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(199,183,136,0.3)",
                            color: "white",
                          }}
                        />

                        <button
                          onClick={() => {
                            setDriverMapFullscreen(!driverMapFullscreen);
                            setTimeout(() => {
                              if (driverMapInstanceRef.current) {
                                driverMapInstanceRef.current.resize();
                              }
                            }, 100);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(199,183,136,0.3)",
                            color: "#C7B788",
                          }}
                          title={driverMapFullscreen ? "Minimize" : "Full screen"}
                        >
                          {driverMapFullscreen ? "⊠" : "⊞"}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        height: driverMapFullscreen ? undefined : "240px",
                        flex: driverMapFullscreen ? "1" : undefined,
                        position: "relative",
                      }}
                    >
                      {driverSelectedSummaries.length === 0 && summariesStatus === "Connected" && (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          style={{ background: "rgba(26,42,27,0.95)", zIndex: 1 }}
                        >
                          <span className="text-2xl">🛣️</span>
                          <p className="text-xs font-semibold text-white">
                            No routes found for this {driverMapMode}
                          </p>
                          <p className="text-xs" style={{ color: "#C7B788" }}>
                            Try another date or switch between day and week.
                          </p>
                        </div>
                      )}

                      <div
                        id="driver-route-map"
                        style={{
                          width: "100%",
                          height: driverMapFullscreen ? "100%" : "240px",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      />
                    </div>

                    <div
                      className="px-4 py-2 flex items-center justify-between"
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        borderTop: "1px solid rgba(199,183,136,0.1)",
                        color: "#C7B788",
                      }}
                    >
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span
                            style={{
                              background: "#9FCC81",
                              borderRadius: "50%",
                              width: 8,
                              height: 8,
                              display: "inline-block",
                            }}
                          />
                          Start
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            style={{
                              background: "#f87171",
                              borderRadius: "50%",
                              width: 8,
                              height: 8,
                              display: "inline-block",
                            }}
                          />
                          End
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            style={{
                              background: "#0078FF",
                              borderRadius: 3,
                              width: 12,
                              height: 3,
                              display: "inline-block",
                            }}
                          />
                          Route
                        </span>
                        {selectedRouteId && (
                          <span className="flex items-center gap-1.5">
                            <span
                              style={{
                                background: "#fbbf24",
                                borderRadius: 3,
                                width: 12,
                                height: 3,
                                display: "inline-block",
                              }}
                            />
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (driverMapInstanceRef.current) {
                              driverMapInstanceRef.current.setCamera({
                                zoom: driverMapInstanceRef.current.getCamera().zoom + 1,
                                type: "ease",
                                duration: 200,
                              });
                            }
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(199,183,136,0.3)",
                            color: "white",
                          }}
                          title="Zoom in"
                        >
                          +
                        </button>

                        <button
                          onClick={() => {
                            if (driverMapInstanceRef.current) {
                              driverMapInstanceRef.current.setCamera({
                                zoom: driverMapInstanceRef.current.getCamera().zoom - 1,
                                type: "ease",
                                duration: 200,
                              });
                            }
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(199,183,136,0.3)",
                            color: "white",
                          }}
                          title="Zoom out"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-xl p-4"
                    style={{
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(199,183,136,0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#C7B788" }}>
                          Route History
                        </p>
                        {!showRouteHistory && (
                          <p className="text-[11px]" style={{ color: "#C7B788" }}>
                            Hidden to keep dashboard clean
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {showRouteHistory && (
                          <p className="text-[11px]" style={{ color: "#C7B788" }}>
                            {driverSelectedSummaries.length} route{driverSelectedSummaries.length === 1 ? "" : "s"}
                          </p>
                        )}
                        <button
                          onClick={() => setShowRouteHistory((prev) => !prev)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{
                            background: "rgba(102,175,182,0.12)",
                            border: "1px solid rgba(102,175,182,0.3)",
                            color: "#66AFB6",
                          }}
                        >
                          {showRouteHistory ? "Hide" : "View all"}
                        </button>
                      </div>
                    </div>

                    {showRouteHistory && (
                      <>
                        {driverSelectedSummaries.length === 0 ? (
                          <p className="mt-3 text-xs" style={{ color: "#C7B788" }}>
                            No route summaries found for the selected {driverMapMode}.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {driverSelectedSummaries.map((route) => {
                              const routeId = route.routeId || route.id;
                              const isSelected = selectedRouteId === routeId;

                              return (
                                <button
                                  key={routeId}
                                  type="button"
                                  onClick={() =>
                                    setSelectedRouteId((current) =>
                                      current === routeId ? null : routeId
                                    )
                                  }
                                  className="w-full rounded-lg p-3 text-left transition"
                                  style={{
                                    background: isSelected
                                      ? "rgba(251,191,36,0.12)"
                                      : "rgba(255,255,255,0.04)",
                                    border: isSelected
                                      ? "1px solid rgba(251,191,36,0.55)"
                                      : "1px solid rgba(199,183,136,0.12)",
                                    boxShadow: isSelected
                                      ? "0 0 12px rgba(251,191,36,0.18)"
                                      : "none",
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-white">
                                      {new Date(route.completedAt).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      {isSelected && (
                                        <span
                                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                          style={{
                                            background: "rgba(251,191,36,0.16)",
                                            color: "#fbbf24",
                                            border: "1px solid rgba(251,191,36,0.35)",
                                          }}
                                        >
                                          Selected
                                        </span>
                                      )}
                                      <span
                                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                          background: "rgba(102,175,182,0.14)",
                                          color: "#66AFB6",
                                          border: "1px solid rgba(102,175,182,0.25)",
                                        }}
                                      >
                                        {(Number(route.totalDistanceMiles) || 0).toFixed(1)} mi
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    className="mt-2 grid grid-cols-2 gap-2 text-xs"
                                    style={{ color: "#C7B788" }}
                                  >
                                    <div>Points: {route.pointCount ?? 0}</div>
                                    <div>Duration: {formatDurationMinutes(route.durationSeconds)}</div>
                                    <div>Avg Speed: {(Number(route.averageSpeedMph) || 0).toFixed(1)} mph</div>
                                    <div>Moving: {formatDurationMinutes(route.movingSeconds)}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div
              className="px-4 sm:px-6 py-3 text-sm text-white"
              style={{
                background: "linear-gradient(90deg, #1a2a1b, #1e2a2b)",
                borderTop: "1px solid rgba(199,183,136,0.15)",
              }}
            >
              Tip: Keep flagged notes low by stopping routes.
            </div>
          </div>

          <div
            className="rounded-2xl shadow-sm p-4 sm:p-6 min-w-0"
            style={{
              border: "1px solid rgba(199,183,136,0.2)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="text-sm font-semibold self-start lg:self-auto"
                style={{ color: "#9FCC81" }}
              >
                {showAllActivity ? "Show less" : `View all (${allActivity.length})`}
              </button>
            </div>

            <ul className="mt-4 divide-y min-w-0" style={{ borderColor: "rgba(199,183,136,0.15)" }}>
              {activity.map((a, idx) => (
                <li
                  key={idx}
                  className="py-3 flex flex-col gap-2 min-w-0 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-base leading-none shrink-0 mt-0.5">{a.icon}</span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/85 break-words leading-5">
                        {a.text}
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-xs pl-7 lg:pl-0 lg:text-right shrink-0"
                    style={{ color: "#C7B788" }}
                  >
                    {formatTime(a.time)}
                  </span>
                </li>
              ))}

              {activity.length === 0 && (
                <li className="py-6 text-sm" style={{ color: "#C7B788" }}>
                  No recent activity yet.
                </li>
              )}
            </ul>

            <div
              className="mt-5 rounded-xl p-4"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(199,183,136,0.15)",
              }}
            >
              <p className="text-xs" style={{ color: "#C7B788" }}>
                Next recommended action
              </p>
              <p className="mt-1 font-semibold text-white">Check reports submitted today</p>
              <p className="mt-1 text-sm" style={{ color: "#C7B788" }}>
                {cards[2].value} reports received so far.
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl shadow-sm p-6"
          style={{
            border: "1px solid rgba(199,183,136,0.2)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
          }}
        >
          <h2 className="text-lg font-semibold text-white">Reports Overview</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total reports today", value: cards[2].value },
              { label: "Drivers active", value: cards[0].value },
              { label: "Open flags", value: cards[3].value },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(199,183,136,0.15)",
                }}
              >
                <p className="text-sm" style={{ color: "#C7B788" }}>
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}