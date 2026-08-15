import { Bell, Search } from "lucide-react";

import type { User } from "../../types/auth";

function Navbar() {
  const storedUser = localStorage.getItem("user");

  let user: User | null = null;

  try {
    user = storedUser
      ? (JSON.parse(storedUser) as User)
      : null;
  } catch {
    user = null;
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2">
        <Search
          size={17}
          className="shrink-0 text-slate-400"
        />

        <input
          type="search"
          placeholder="Search datasets..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="ml-6 flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="text-slate-400 hover:text-white"
        >
          <Bell size={19} />
        </button>

        <div className="text-right">
          <p className="text-sm font-medium text-white">
            {user?.name ?? "User"}
          </p>

          <p className="text-xs text-slate-400">
            {user?.email ?? ""}
          </p>
        </div>
      </div>
    </header>
  );
}

export default Navbar;