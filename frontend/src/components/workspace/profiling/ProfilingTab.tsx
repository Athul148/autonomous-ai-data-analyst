// ProfilingTab.tsx

import {
  ScanSearch,
} from "lucide-react";

import ProfileSummary from "./ProfileSummary";
import ColumnSearch from "./ColumnSearch";

import type {
  DatasetProfile,
} from "../../../types/profile";


interface ProfilingTabProps {
  profile: DatasetProfile;
}


function ProfilingTab({
  profile,
}: ProfilingTabProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <ScanSearch
            size={17}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Data Profiling
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Inspect dataset structure, column characteristics,
            missing values and cardinality patterns.
          </p>
        </div>
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <ProfileSummary
          profile={
            profile
          }
        />
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <ColumnSearch
          columns={
            profile.column_metadata
          }
        />
      </div>
    </section>
  );
}


export default ProfilingTab;