import {
  LayoutDashboard,
} from "lucide-react";

import ColumnExplorer from "./ColumnExplorer";
import OverviewCards from "./OverviewCards";

import type {
  DatasetProfile,
} from "../../../types/profile";


interface OverviewTabProps {
  profile: DatasetProfile;
}


function OverviewTab({
  profile,
}: OverviewTabProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <LayoutDashboard
            size={17}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Dataset Overview
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review the dataset structure,
            quality summary and column-level
            information before deeper analysis.
          </p>
        </div>
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <OverviewCards
          profile={
            profile
          }
        />
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <ColumnExplorer
          columns={
            profile.column_metadata
          }
        />
      </div>
    </section>
  );
}


export default OverviewTab;