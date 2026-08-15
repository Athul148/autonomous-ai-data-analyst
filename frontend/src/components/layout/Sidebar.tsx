import {
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import type {
  User,
} from "../../types/auth";


function Sidebar() {
  const navigate =
    useNavigate();

  const storedUser =
    localStorage.getItem(
      "user",
    );

  let user: User | null =
    null;

  try {
    user = storedUser
      ? (
          JSON.parse(
            storedUser,
          ) as User
        )
      : null;
  } catch {
    user = null;
  }


  function handleLogout() {
    localStorage.removeItem(
      "access_token",
    );

    localStorage.removeItem(
      "user",
    );

    navigate("/");
  }


  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    [
      "group flex items-center gap-3 rounded-xl px-3.5 py-3",
      "text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
        : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
    ].join(" ");


  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-800/80 bg-slate-900">
      {/* Brand */}
      <div className="border-b border-slate-800/80 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/40">
            <BarChart3
              size={20}
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white">
              DataPilot AI
            </h1>

            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-blue-300">
              AI Data Analyst
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Intelligent analysis, insights and dashboards in one workspace.
        </p>
      </div>


      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Workspace
        </p>

        <nav className="space-y-1.5">
          <NavLink
            to="/dashboard"
            className={linkClass}
          >
            <LayoutDashboard
              size={18}
              className="shrink-0"
            />

            <span>
              Dashboard
            </span>
          </NavLink>


          <NavLink
            to="/datasets"
            className={linkClass}
          >
            <Database
              size={18}
              className="shrink-0"
            />

            <span>
              Datasets
            </span>
          </NavLink>


          <NavLink
            to="/reports"
            className={linkClass}
          >
            <FileText
              size={18}
              className="shrink-0"
            />

            <span>
              Reports
            </span>
          </NavLink>


          <NavLink
            to="/analytics-dashboard"
            className={linkClass}
          >
            <BarChart3
              size={18}
              className="shrink-0"
            />

            <span>
              Analytics Dashboard
            </span>
          </NavLink>
        </nav>
      </div>


      {/* User section */}
      <div className="border-t border-slate-800/80 p-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
              <UserRound
                size={18}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name ??
                  "User"}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user?.email ??
                  ""}
              </p>
            </div>
          </div>


          <button
            type="button"
            onClick={
              handleLogout
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <LogOut
              size={16}
            />

            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}


export default Sidebar;