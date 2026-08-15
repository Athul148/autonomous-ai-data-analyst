import {
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";


function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800"
    }`;

  return (
    <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-xl font-bold text-white">
          Autonomous AI TEST
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Data Analyst
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <NavLink
          to="/dashboard"
          className={linkClass}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/datasets"
          className={linkClass}
        >
          <Database size={20} />
          Datasets
        </NavLink>

        <NavLink
          to="/reports"
          className={linkClass}
        >
          <FileText size={20} />
          Reports
        </NavLink>

        <NavLink
          to="/analytics-dashboard"
          className={linkClass}
        >
          <BarChart3 size={20} />
          Analytics Dashboard
        </NavLink>

        <NavLink
          to="/settings"
          className={linkClass}
        >
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}


export default Sidebar;