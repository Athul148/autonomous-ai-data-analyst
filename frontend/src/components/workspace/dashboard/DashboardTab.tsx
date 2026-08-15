import {
  AlertTriangle,
  CalendarDays,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getDashboard,
} from "../../../api/dashboard.api";

import type {
  DashboardResponse,
} from "../../../types/dashboard";

import DashboardChartGrid from "./DashboardChartGrid";
import DashboardFilters from "./DashboardFilters";
import DashboardInsights from "./DashboardInsights";
import DashboardKPICards from "./DashboardKPICards";


interface DashboardTabProps {
  datasetId: number;
}


function DashboardTab({
  datasetId,
}: DashboardTabProps) {
  const [
    dashboardData,
    setDashboardData,
  ] =
    useState<
      DashboardResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response =
        await getDashboard(
          datasetId,
        );

      setDashboardData(
        response,
      );
    } catch {
      setDashboardData(
        null,
      );

      setError(
        "Unable to load the dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDashboard(
            datasetId,
          );

        if (!cancelled) {
          setDashboardData(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setDashboardData(
            null,
          );

          setError(
            "Unable to load the dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  if (loading) {
    return (
      <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-950">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <LoaderCircle
              size={26}
              className="animate-spin text-blue-300"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-300">
            Building analytics dashboard
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Selecting KPIs, visuals and insights...
          </p>
        </div>
      </section>
    );
  }

  if (
    error ||
    !dashboardData
  ) {
    return (
      <section className="rounded-2xl border border-red-900/70 bg-red-950/20 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-300"
          />

          <div>
            <p className="text-sm font-medium text-red-300">
              {error ||
                "Dashboard data is unavailable."}
            </p>

            <button
              type="button"
              onClick={
                loadDashboard
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-800 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-950"
            >
              <RefreshCw
                size={15}
              />

              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const {
    dashboard,
  } = dashboardData;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#070b14] shadow-2xl shadow-black/20">
      {/* Report header */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/35 via-slate-950 to-violet-950/20" />

        <div className="relative flex flex-col gap-6 px-6 py-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-950/20">
              <LayoutDashboard
                size={22}
                className="text-blue-300"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                  Executive Report
                </span>

                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles
                    size={12}
                  />
                  AI generated
                </span>
              </div>

              <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-white lg:text-3xl">
                {
                  dashboard.title
                }
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                {dashboard.description ||
                  "Interactive executive summary generated from the selected dataset."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>
                  Dataset ID{" "}
                  <strong className="font-semibold text-slate-300">
                    {
                      dashboardData.dataset_id
                    }
                  </strong>
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span>
                  {
                    dashboard.charts.length
                  }{" "}
                  visuals
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span>
                  {
                    dashboard.insights.length
                  }{" "}
                  insights
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-500 sm:flex">
              <CalendarDays
                size={14}
              />
              Live dataset view
            </div>

            <button
              type="button"
              onClick={
                loadDashboard
              }
              disabled={
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-700 hover:bg-blue-950/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
              />

              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Report canvas */}
      <div className="space-y-5 p-5 lg:p-6">
        <DashboardKPICards
          kpis={
            dashboard.kpis
          }
        />

        <DashboardFilters
          filters={
            dashboard.filters
          }
        />

        <DashboardChartGrid
          charts={
            dashboard.charts
          }
        />

        <DashboardInsights
          insights={
            dashboard.insights
          }
        />

        <footer className="flex flex-col gap-2 border-t border-slate-800 pt-4 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            DataPilot AI · Automated Analytics Report
          </span>

          <span>
            Generated from the selected dataset analysis
          </span>
        </footer>
      </div>
    </section>
  );
}


export default DashboardTab;