import {
  BarChart3,
  Bot,
  ChartNoAxesCombined,
  LayoutDashboard,
  MessageSquareText,
  ScanSearch,
  ShieldCheck,
  Sigma,
  Sparkles,
  Workflow,
} from "lucide-react";


const tabs = [
  {
    id: "Overview",
    label: "Overview",
    icon: LayoutDashboard,
  },

  {
    id: "Profiling",
    label: "Data Profiling",
    icon: ScanSearch,
  },

  {
    id: "Statistics",
    label: "Statistics",
    icon: Sigma,
  },

  {
    id: "Quality",
    label: "Quality",
    icon: ShieldCheck,
  },

  {
    id: "Validation",
    label: "Validation",
    icon: Workflow,
  },

  {
    id: "Cleaning",
    label: "Cleaning",
    icon: Sparkles,
  },

  {
    id: "Correlation",
    label: "Correlation",
    icon: BarChart3,
  },

  {
    id: "Charts",
    label: "Visualizations",
    icon: ChartNoAxesCombined,
  },

  {
    id: "AI Report",
    label: "AI Report",
    icon: Bot,
  },

  {
    id: "AI Chat",
    label: "AI Chat",
    icon: MessageSquareText,
  },
];


interface WorkspaceTabsProps {
  activeTab: string;

  onChange: (
    tab: string,
  ) => void;
}


function WorkspaceTabs({
  activeTab,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-2">
      <nav className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map(
            (
              tab,
            ) => {
              const Icon =
                tab.icon;

              const isActive =
                activeTab ===
                tab.id;

              return (
                <button
                  key={
                    tab.id
                  }
                  type="button"
                  onClick={() =>
                    onChange(
                      tab.id,
                    )
                  }
                  className={[
                    "group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5",
                    "text-sm font-medium whitespace-nowrap",
                    "transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-500 hover:bg-slate-800/70 hover:text-slate-200",
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    size={
                      16
                    }
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-600 transition group-hover:text-slate-300"
                    }
                  />

                  <span>
                    {
                      tab.label
                    }
                  </span>
                </button>
              );
            },
          )}
        </div>
      </nav>
    </div>
  );
}


export default WorkspaceTabs;