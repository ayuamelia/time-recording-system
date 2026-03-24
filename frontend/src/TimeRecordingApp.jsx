import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3000/api/v1";

const theme = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceHover: "#1c2330",
  border: "#21262d",
  borderHover: "#30363d",
  text: "#e6edf3",
  textMuted: "#7d8590",
  textDim: "#484f58",
  amber: "#f0a030",
  amberDim: "#3d2a0a",
  amberGlow: "rgba(240,160,48,0.15)",
  green: "#3fb950",
  greenDim: "#0d2c14",
  red: "#f85149",
  redDim: "#2d0f0e",
  blue: "#58a6ff",
  blueDim: "#0d1f3c",
  purple: "#bc8cff",
  purpleDim: "#1e1230",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${theme.bg}; color: ${theme.text}; font-family: 'IBM Plex Sans', sans-serif; min-height: 100vh; }
  .mono { font-family: 'IBM Plex Mono', monospace; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }

  .animate-in { animation: fadeIn 0.3s ease forwards; }
  .animate-slide { animation: slideIn 0.25s ease forwards; }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 6px; border: 1px solid transparent;
    font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: ${theme.amber}; color: #000; border-color: ${theme.amber}; }
  .btn-primary:hover:not(:disabled) { background: #f5b040; }
  .btn-danger { background: ${theme.redDim}; color: ${theme.red}; border-color: ${theme.red}44; }
  .btn-danger:hover:not(:disabled) { background: #3d1210; border-color: ${theme.red}88; }
  .btn-ghost { background: transparent; color: ${theme.textMuted}; border-color: ${theme.border}; }
  .btn-ghost:hover:not(:disabled) { background: ${theme.surfaceHover}; color: ${theme.text}; border-color: ${theme.borderHover}; }
  .btn-blue { background: ${theme.blueDim}; color: ${theme.blue}; border-color: ${theme.blue}44; }
  .btn-blue:hover:not(:disabled) { background: #0d2a50; border-color: ${theme.blue}88; }

  .input {
    width: 100%; padding: 10px 14px; background: ${theme.bg};
    border: 1px solid ${theme.border}; border-radius: 6px;
    color: ${theme.text}; font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.15s;
  }
  .input:focus { border-color: ${theme.amber}; }
  .input::placeholder { color: ${theme.textDim}; }
  select.input { cursor: pointer; }

  .card { background: ${theme.surface}; border: 1px solid ${theme.border}; border-radius: 8px; padding: 24px; }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
    font-family: 'IBM Plex Mono', monospace;
  }
  .badge-green  { background: ${theme.greenDim};  color: ${theme.green};  border: 1px solid ${theme.green}33; }
  .badge-amber  { background: ${theme.amberDim};  color: ${theme.amber};  border: 1px solid ${theme.amber}33; }
  .badge-blue   { background: ${theme.blueDim};   color: ${theme.blue};   border: 1px solid ${theme.blue}33; }
  .badge-red    { background: ${theme.redDim};    color: ${theme.red};    border: 1px solid ${theme.red}33; }
  .badge-purple { background: ${theme.purpleDim}; color: ${theme.purple}; border: 1px solid ${theme.purple}33; }
  .badge-dim    { background: #1c1c1c; color: ${theme.textMuted}; border: 1px solid ${theme.border}; }

  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
  .dot-green { background: ${theme.green}; animation: pulse 2s infinite; }
  .dot-dim   { background: ${theme.textDim}; }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.1); border-top-color: currentColor;
    border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
  }

  .table { width: 100%; border-collapse: collapse; }
  .table th {
    text-align: left; font-size: 11px; font-weight: 500; color: ${theme.textDim};
    text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 12px;
    border-bottom: 1px solid ${theme.border}; font-family: 'IBM Plex Mono', monospace;
  }
  .table td { padding: 12px; font-size: 13px; border-bottom: 1px solid ${theme.border}66; vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr { transition: background 0.1s; }
  .table tr:hover td { background: ${theme.surfaceHover}; }

  .divider { height: 1px; background: ${theme.border}; margin: 0; }

  .toast {
    position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 500; z-index: 999; animation: slideIn 0.2s ease; max-width: 320px;
  }
  .toast-success { background: ${theme.greenDim}; color: ${theme.green}; border: 1px solid ${theme.green}44; }
  .toast-error   { background: ${theme.redDim};   color: ${theme.red};   border: 1px solid ${theme.red}44; }
  .toast-info    { background: ${theme.blueDim};  color: ${theme.blue};  border: 1px solid ${theme.blue}44; }

  .nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-radius: 6px; font-size: 14px; font-weight: 500;
    color: ${theme.textMuted}; cursor: pointer; transition: all 0.15s;
    border: 1px solid transparent; user-select: none;
  }
  .nav-link:hover { background: ${theme.surfaceHover}; color: ${theme.text}; }
  .nav-link.active { background: ${theme.amberDim}; color: ${theme.amber}; border-color: ${theme.amber}33; }

  .bar-track { flex: 1; height: 6px; background: ${theme.border}; border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
`;

// ─── Shared hooks & helpers ────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}
function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast toast-${toast.type}`}>{toast.msg}</div>;
}

function useApi(token) {
  return useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data.data;
  }, [token]);
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDuration(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p style={{ fontSize: 11, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontWeight: 500 }}>
      {children}
    </p>
  );
}
function SectionTitle({ children, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{children}</h2>
      {subtitle && <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}
function EmptyState({ children }) {
  return <div style={{ padding: "48px 0", textAlign: "center", color: theme.textDim, fontSize: 13 }}>{children}</div>;
}
function Spinner() {
  return <div style={{ padding: 40, textAlign: "center" }}><span className="spinner" style={{ display: "block", margin: "0 auto" }} /></div>;
}

// ─── Live Clock & Elapsed Timer ────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="mono" style={{ fontSize: 13, color: theme.textMuted }}>{time.toLocaleTimeString("en-GB")}</span>;
}

function ElapsedTimer({ clockInIso }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(clockInIso).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [clockInIso]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const display = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const isOvertime = elapsed >= 8 * 3600;

  return (
    <div style={{ textAlign: "center" }}>
      <Label>Elapsed</Label>
      <p className="mono" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "0.04em", color: isOvertime ? theme.amber : theme.green, transition: "color 1s ease", lineHeight: 1 }}>
        {display}
      </p>
      {isOvertime && <p style={{ fontSize: 11, color: theme.amber, marginTop: 6, opacity: 0.8 }}>Overtime running</p>}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLogin(data.data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: `radial-gradient(ellipse at 50% 0%, ${theme.amberGlow} 0%, transparent 60%), ${theme.bg}` }}>
      <div className="animate-in" style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.amberDim, border: `1px solid ${theme.amber}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>⏱</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>TimeTrack</h1>
          <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 6 }}>Sign in to your workspace</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <Label>Email</Label>
              <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div style={{ marginBottom: 24 }}>
              <Label>Password</Label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ padding: "10px 14px", background: theme.redDim, border: `1px solid ${theme.red}44`, borderRadius: 6, fontSize: 13, color: theme.red, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: theme.textDim, marginTop: 20 }}>
          alice@example.com / password123 &nbsp;·&nbsp; bob@example.com / password123 (admin)
        </p>
      </div>
    </div>
  );
}

// ─── Clock Widget ─────────────────────────────────────────────────────────────
function ClockWidget({ userId, token, onAction }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();
  const api = useApi(token);

  const fetchStatus = useCallback(async () => {
    try { setStatus(await api(`/clock/status/${userId}`)); } catch {}
  }, [userId, api]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function handleClock() {
    setLoading(true);
    try {
      const isClockedIn = status?.isClockedIn;
      await api(isClockedIn ? "/clock/out" : "/clock/in", { method: "POST", body: { userId } });
      show(isClockedIn ? "Clocked out successfully" : "Clocked in — have a great session!", "success");
      await fetchStatus();
      onAction();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const isClockedIn = status?.isClockedIn;

  return (
    <>
      <Toast toast={toast} />
      <div className="card" style={{ background: isClockedIn ? `linear-gradient(135deg, ${theme.greenDim} 0%, ${theme.surface} 60%)` : theme.surface, borderColor: isClockedIn ? `${theme.green}33` : theme.border, transition: "all 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <Label>Current Status</Label>
            {status === null
              ? <span className="badge badge-dim">Loading…</span>
              : isClockedIn
                ? <span className="badge badge-green"><span className="dot dot-green" />Clocked In</span>
                : <span className="badge badge-dim"><span className="dot dot-dim" />Not Clocked In</span>}
          </div>
          <LiveClock />
        </div>

        {isClockedIn && status?.currentRecord && (
          <div style={{ padding: "20px 16px", background: "rgba(0,0,0,0.25)", borderRadius: 8, marginBottom: 20, border: `1px solid ${theme.green}22` }}>
            <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${theme.border}66` }}>
              <ElapsedTimer clockInIso={status.currentRecord.clockIn} />
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1 }}>
                <Label>Clocked in at</Label>
                <p className="mono" style={{ fontSize: 14, color: theme.green, fontWeight: 500 }}>{formatTime(status.currentRecord.clockIn)}</p>
              </div>
              <div style={{ flex: 1 }}>
                <Label>Date</Label>
                <p className="mono" style={{ fontSize: 14, color: theme.textMuted, fontWeight: 500 }}>{formatDate(status.currentRecord.clockIn)}</p>
              </div>
            </div>
          </div>
        )}

        <button className={`btn ${isClockedIn ? "btn-danger" : "btn-primary"}`} onClick={handleClock} disabled={loading || status === null} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "12px 20px" }}>
          {loading ? <span className="spinner" /> : null}
          {loading ? "Processing…" : isClockedIn ? "Clock Out" : "Clock In"}
        </button>
      </div>
    </>
  );
}

// ─── Summary Stats ─────────────────────────────────────────────────────────────
function SummaryStats({ userId, token, refreshKey }) {
  const [data, setData] = useState(null);
  const api = useApi(token);

  useEffect(() => {
    api(`/reports?userId=${userId}&from=${daysAgo(30)}&to=${daysAgo(0)}`)
      .then(d => setData(d)).catch(() => {});
  }, [userId, api, refreshKey]);

  const stats = [
    { label: "Total Worked", value: data ? formatDuration(data.aggregateTotalWorkedMinutes) : "—", color: theme.text },
    { label: "Overtime", value: data ? formatDuration(data.aggregateTotalOvertimeMinutes) : "—", color: data?.aggregateTotalOvertimeMinutes > 0 ? theme.amber : theme.textMuted },
    { label: "Working Days", value: data?.totalWorkingDays ?? "—", color: theme.blue },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {stats.map(s => (
        <div key={s.label} className="card" style={{ padding: "16px 20px" }}>
          <Label>{s.label}</Label>
          <p className="mono" style={{ fontSize: 18, fontWeight: 500, color: s.color }}>{s.value}</p>
          <p style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>Last 30 days</p>
        </div>
      ))}
    </div>
  );
}

// ─── Time Records Table ────────────────────────────────────────────────────────
function TimeRecordsTable({ userId, token, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const api = useApi(token);
  const limit = 8;

  useEffect(() => {
    setLoading(true);
    api(`/time-records?userId=${userId}&page=${page}&limit=${limit}`)
      .then(d => { setRecords(d?.records || []); setTotal(d?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, api, page, refreshKey]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Time Records</h3>
          <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{total} records total</p>
        </div>
        <span className="badge badge-dim">{page} / {totalPages || 1}</span>
      </div>
      <div className="divider" />
      {loading ? <Spinner /> : records.length === 0 ? <EmptyState>No records found</EmptyState> : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Duration</th><th>Overtime</th><th>Status</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="animate-slide">
                  <td><span className="mono" style={{ fontSize: 12 }}>{formatDate(r.clockIn)}</span></td>
                  <td><span className="mono" style={{ color: theme.green, fontSize: 13 }}>{formatTime(r.clockIn)}</span></td>
                  <td><span className="mono" style={{ color: r.clockOut ? theme.red : theme.textDim, fontSize: 13 }}>{formatTime(r.clockOut)}</span></td>
                  <td><span className="mono" style={{ fontSize: 13 }}>{formatDuration(r.workedMinutes)}</span></td>
                  <td>
                    {r.overtimeMinutes > 0
                      ? <span className="badge badge-amber" style={{ fontSize: 11 }}>+{formatDuration(r.overtimeMinutes)}</span>
                      : <span style={{ color: theme.textDim }}>—</span>}
                  </td>
                  <td>
                    {!r.clockOut
                      ? <span className="badge badge-green" style={{ fontSize: 11 }}><span className="dot dot-green" />Active</span>
                      : <span className="badge badge-dim" style={{ fontSize: 11 }}>Done</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <>
          <div className="divider" />
          <div style={{ padding: "14px 24px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage({ user, token }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const userId = user?.userId;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
        </h1>
        <p style={{ fontSize: 14, color: theme.textMuted, marginTop: 4 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
      {userId && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ClockWidget userId={userId} token={token} onAction={() => setRefreshKey(k => k + 1)} />
            <SummaryStats userId={userId} token={token} refreshKey={refreshKey} />
          </div>
          <TimeRecordsTable userId={userId} token={token} refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
}

// ─── Reports Page ─────────────────────────────────────────────────────────────
function ReportsPage({ user, token }) {
  const api = useApi(token);
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(user?.userId || "");
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(daysAgo(0));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) {
      api("/users").then(d => setUsers(Array.isArray(d) ? d : d?.users || [])).catch(() => {});
    }
  }, [isAdmin, api]);

  async function fetchReport() {
    if (!selectedUserId) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      setReport(await api(`/reports?userId=${selectedUserId}&from=${from}&to=${to}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const maxMinutes = report ? Math.max(...report.dailyTotals.map(d => d.totalWorkedMinutes), 1) : 1;

  return (
    <div className="animate-in">
      <SectionTitle subtitle="Generate a detailed work report for any date range">Reports</SectionTitle>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 24, padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 160px 160px auto" : "160px 160px auto", gap: 12, alignItems: "flex-end" }}>
          {isAdmin && (
            <div>
              <Label>Employee</Label>
              <select className="input" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                <option value="">Select employee…</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label>From</Label>
            <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div>
            <button className="btn btn-primary" onClick={fetchReport} disabled={loading || !selectedUserId} style={{ padding: "10px 20px" }}>
              {loading ? <span className="spinner" /> : "Generate"}
            </button>
          </div>
        </div>
        {error && <p style={{ marginTop: 12, fontSize: 13, color: theme.red }}>{error}</p>}
      </div>

      {loading && <Spinner />}

      {report && (
        <>
          {/* Aggregate summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Employee", value: report.userName, color: theme.text, mono: false },
              { label: "Total Worked", value: formatDuration(report.aggregateTotalWorkedMinutes), color: theme.text, mono: true },
              { label: "Total Overtime", value: formatDuration(report.aggregateTotalOvertimeMinutes), color: report.aggregateTotalOvertimeMinutes > 0 ? theme.amber : theme.textMuted, mono: true },
              { label: "Working Days", value: String(report.totalWorkingDays), color: theme.blue, mono: true },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: "16px 20px" }}>
                <Label>{s.label}</Label>
                <p className={s.mono ? "mono" : ""} style={{ fontSize: s.mono ? 20 : 15, fontWeight: 600, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Daily breakdown */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 16px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Daily Breakdown</h3>
              <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{from} → {to}</p>
            </div>
            <div className="divider" />
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr><th>Date</th><th>Day</th><th>Status</th><th>Sessions</th><th>Worked</th><th>Overtime</th><th style={{ width: 180 }}>Chart</th></tr>
                </thead>
                <tbody>
                  {report.dailyTotals.map(day => {
                    const pct = Math.min((day.totalWorkedMinutes / maxMinutes) * 100, 100);
                    const isOT = day.totalWorkedMinutes > 480;
                    return (
                      <tr key={day.date} className="animate-slide">
                        <td><span className="mono" style={{ fontSize: 12 }}>{day.date}</span></td>
                        <td><span style={{ color: theme.textMuted, fontSize: 12 }}>{new Date(day.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" })}</span></td>
                        <td>
                          {day.isWorkingDay
                            ? <span className="badge badge-blue" style={{ fontSize: 11 }}>Working</span>
                            : <span className="badge badge-dim" style={{ fontSize: 11 }}>Off</span>}
                        </td>
                        <td><span className="mono" style={{ fontSize: 12, color: theme.textMuted }}>{day.sessions}</span></td>
                        <td><span className="mono" style={{ fontSize: 13, color: day.totalWorkedMinutes > 0 ? theme.text : theme.textDim }}>{day.totalWorkedMinutes > 0 ? formatDuration(day.totalWorkedMinutes) : "—"}</span></td>
                        <td>
                          {day.totalOvertimeMinutes > 0
                            ? <span className="badge badge-amber" style={{ fontSize: 11 }}>+{formatDuration(day.totalOvertimeMinutes)}</span>
                            : <span style={{ color: theme.textDim, fontSize: 12 }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${pct}%`, background: isOT ? theme.amber : theme.green, opacity: day.totalWorkedMinutes > 0 ? 1 : 0.1 }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <EmptyState>Select a date range{isAdmin ? " and employee" : ""}, then click Generate</EmptyState>
      )}
    </div>
  );
}

// ─── Admin Page ────────────────────────────────────────────────────────────────
function AdminPage({ token }) {
  const [tab, setTab] = useState("config");
  const tabs = [
    { id: "config",   label: "Work Config" },
    { id: "calendar", label: "Calendar Overrides" },
    { id: "users",    label: "Users" },
  ];

  return (
    <div className="animate-in">
      <SectionTitle subtitle="System configuration and user management">Admin Panel</SectionTitle>
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${theme.border}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "9px 20px", background: "none", border: "none",
            borderBottom: tab === t.id ? `2px solid ${theme.amber}` : "2px solid transparent",
            color: tab === t.id ? theme.amber : theme.textMuted,
            fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 500,
            cursor: "pointer", marginBottom: -1, transition: "all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "config"   && <WorkConfigPanel   token={token} />}
      {tab === "calendar" && <CalendarPanel      token={token} />}
      {tab === "users"    && <UsersPanel         token={token} />}
    </div>
  );
}

// ─── Work Config Panel ─────────────────────────────────────────────────────────
function WorkConfigPanel({ token }) {
  const api = useApi(token);
  const { toast, show } = useToast();
  const [config, setConfig] = useState(null);
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    api("/config").then(d => {
      setConfig(d);
      setHours(d?.normalHoursPerDay ?? 8);
      const parsed = typeof d?.workingDaysOfWeek === "string"
        ? JSON.parse(d.workingDaysOfWeek)
        : d?.workingDaysOfWeek ?? [1, 2, 3, 4, 5];
      setDays(parsed);
    }).catch(() => {});
  }, [api]);

  function toggleDay(d) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api("/config", { method: "PUT", body: { normalHoursPerDay: Number(hours), workingDaysOfWeek: days } });
      show("Work config saved successfully", "success");
    } catch (err) {
      show(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!config) return <Spinner />;

  return (
    <>
      <Toast toast={toast} />
      <div className="card" style={{ maxWidth: 480 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>Work Configuration</h3>
        <div style={{ marginBottom: 24 }}>
          <Label>Normal hours per day</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input className="input" type="number" min={1} max={24} value={hours} onChange={e => setHours(e.target.value)} style={{ maxWidth: 100 }} />
            <span style={{ fontSize: 13, color: theme.textMuted }}>hours / day</span>
          </div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <Label>Working days of the week</Label>
          <div style={{ display: "flex", gap: 8 }}>
            {dayLabels.map((label, idx) => {
              const active = days.includes(idx);
              return (
                <button key={idx} onClick={() => toggleDay(idx)} style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: active ? theme.amberDim : theme.bg,
                  border: `1px solid ${active ? theme.amber + "66" : theme.border}`,
                  color: active ? theme.amber : theme.textDim,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner" /> : null}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

// ─── Calendar Overrides Panel ──────────────────────────────────────────────────
function CalendarPanel({ token }) {
  const api = useApi(token);
  const { toast, show } = useToast();
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOverrides = useCallback(async () => {
    setLoading(true);
    try { setOverrides(await api("/calendar-overrides") || []); }
    catch {} finally { setLoading(false); }
  }, [api]);

  useEffect(() => { fetchOverrides(); }, [fetchOverrides]);

  async function handleAdd() {
    if (!date) return;
    setSaving(true);
    try {
      await api("/calendar-overrides", { method: "PUT", body: { date, isWorkingDay: isWorking, description: desc } });
      show(`Override added for ${date}`, "success");
      setDate(""); setDesc("");
      fetchOverrides();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(d) {
    try {
      await api(`/calendar-overrides/${d}`, { method: "DELETE" });
      show("Override removed", "success");
      fetchOverrides();
    } catch (err) {
      show(err.message, "error");
    }
  }

  return (
    <>
      <Toast toast={toast} />
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
        {/* Add form */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Add Override</h3>
          <div style={{ marginBottom: 14 }}>
            <Label>Date</Label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Label>Type</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ label: "Working Day", val: true }, { label: "Holiday", val: false }].map(opt => (
                <button key={String(opt.val)} onClick={() => setIsWorking(opt.val)} style={{
                  flex: 1, padding: "9px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  fontFamily: "'IBM Plex Sans', sans-serif", cursor: "pointer", transition: "all 0.15s",
                  background: isWorking === opt.val ? (opt.val ? theme.greenDim : theme.redDim) : theme.bg,
                  color: isWorking === opt.val ? (opt.val ? theme.green : theme.red) : theme.textDim,
                  border: `1px solid ${isWorking === opt.val ? (opt.val ? theme.green + "55" : theme.red + "55") : theme.border}`,
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Label>Description (optional)</Label>
            <input className="input" type="text" placeholder="e.g. National Holiday" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !date} style={{ width: "100%", justifyContent: "center" }}>
            {saving ? <span className="spinner" /> : null}
            {saving ? "Adding…" : "Add Override"}
          </button>
        </div>

        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 16px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Existing Overrides</h3>
            <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{overrides.length} override{overrides.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="divider" />
          {loading ? <Spinner /> : overrides.length === 0 ? <EmptyState>No overrides set</EmptyState> : (
            <table className="table">
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {overrides.map(o => (
                  <tr key={o.date} className="animate-slide">
                    <td><span className="mono" style={{ fontSize: 12 }}>{o.date}</span></td>
                    <td>
                      {o.isWorkingDay
                        ? <span className="badge badge-green" style={{ fontSize: 11 }}>Working</span>
                        : <span className="badge badge-red" style={{ fontSize: 11 }}>Holiday</span>}
                    </td>
                    <td><span style={{ color: theme.textMuted }}>{o.description || "—"}</span></td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => handleDelete(o.date)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────────────────
function UsersPanel({ token }) {
  const api = useApi(token);
  const { toast, show } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { setUsers(await api("/users").then(d => Array.isArray(d) ? d : d?.users || [])); }
    catch {} finally { setLoading(false); }
  }, [api]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleCreate() {
    setSaving(true);
    try {
      await api("/users", { method: "POST", body: form });
      show(`User ${form.email} created`, "success");
      setForm({ name: "", email: "", password: "", role: "employee" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, email) {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    try {
      await api(`/users/${id}`, { method: "DELETE" });
      show("User deleted", "success");
      fetchUsers();
    } catch (err) {
      show(err.message, "error");
    }
  }

  return (
    <>
      <Toast toast={toast} />
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Users</h3>
            <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{users.length} user{users.length !== 1 ? "s" : ""}</p>
          </div>
          <button className="btn btn-blue" style={{ padding: "7px 16px", fontSize: 13 }} onClick={() => setShowForm(v => !v)}>
            {showForm ? "Cancel" : "+ New User"}
          </button>
        </div>

        {showForm && (
          <>
            <div className="divider" />
            <div style={{ padding: "20px 24px", background: theme.surfaceHover }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 140px", gap: 12, alignItems: "flex-end" }}>
                <div>
                  <Label>Full Name</Label>
                  <input className="input" placeholder="e.g. Jane Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <input className="input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Password</Label>
                  <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div>
                  <Label>Role</Label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !form.name || !form.email || !form.password}>
                  {saving ? <span className="spinner" /> : null}
                  {saving ? "Creating…" : "Create User"}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="divider" />
        {loading ? <Spinner /> : users.length === 0 ? <EmptyState>No users found</EmptyState> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="animate-slide">
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td><span className="mono" style={{ fontSize: 12, color: theme.textMuted }}>{u.email}</span></td>
                  <td>
                    {u.role === "admin"
                      ? <span className="badge badge-purple" style={{ fontSize: 11 }}>admin</span>
                      : <span className="badge badge-dim" style={{ fontSize: 11 }}>employee</span>}
                  </td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => handleDelete(u.id, u.email)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ─── App Shell with Sidebar ────────────────────────────────────────────────────
function AppShell({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    try { setUser(JSON.parse(atob(token.split(".")[1]))); } catch {}
  }, [token]);

  const isAdmin = user?.role === "admin";

  const navItems = [
    { id: "dashboard", icon: "◼", label: "Dashboard" },
    { id: "reports",   icon: "▤",  label: "Reports" },
    ...(isAdmin ? [{ id: "admin", icon: "⚙",  label: "Admin" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: theme.bg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: theme.surface, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.amberDim, border: `1px solid ${theme.amber}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⏱</div>
            <span style={{ fontWeight: 600, fontSize: 15 }}>TimeTrack</span>
          </div>
        </div>

        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
              <span style={{ fontSize: 13, fontFamily: "monospace" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: "14px 16px", borderTop: `1px solid ${theme.border}` }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {isAdmin
              ? <span className="badge badge-purple" style={{ fontSize: 10, padding: "2px 8px" }}>admin</span>
              : <span className="badge badge-dim" style={{ fontSize: 10, padding: "2px 8px" }}>employee</span>}
            <button onClick={onLogout} style={{ background: "none", border: "none", color: theme.textDim, fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "32px 32px", overflowY: "auto" }}>
        {page === "dashboard" && user && <DashboardPage user={user} token={token} />}
        {page === "reports"   && user && <ReportsPage   user={user} token={token} />}
        {page === "admin"     && isAdmin  && <AdminPage token={token} />}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("tt_token") || null);
  function handleLogin(t) { sessionStorage.setItem("tt_token", t); setToken(t); }
  function handleLogout() { sessionStorage.removeItem("tt_token"); setToken(null); }
  return (
    <>
      <style>{css}</style>
      {token
        ? <AppShell token={token} onLogout={handleLogout} />
        : <LoginScreen onLogin={handleLogin} />}
    </>
  );
}
