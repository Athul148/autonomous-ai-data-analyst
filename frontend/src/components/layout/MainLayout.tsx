import {
  Outlet,
} from "react-router-dom";

import Sidebar from "./Sidebar";


function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}


export default MainLayout;