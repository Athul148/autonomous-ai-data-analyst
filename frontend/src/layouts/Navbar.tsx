import { Search, Bell } from "lucide-react";

function Navbar() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}",
  );

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2">
        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          placeholder="Search datasets..."
          className="bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <Bell
          size={20}
          className="text-slate-400"
        />

        <div className="text-right">
          <p className="text-sm font-medium text-white">
            {user.name}
          </p>

          <p className="text-xs text-slate-400">
            {user.email}
          </p>
        </div>
      </div>
    </header>
  );
}

export default Navbar;