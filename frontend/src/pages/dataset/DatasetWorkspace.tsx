import {
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  getDataset,
  getDatasetProfile,
} from "../../api/dataset.api";

import AIChatTab from "../../components/workspace/chat/AIChatTab";
import CleaningTab from "../../components/workspace/cleaning/CleaningTab";
import CorrelationTab from "../../components/workspace/correlation/CorrelationTab";
import DatasetHeader from "../../components/workspace/overview/DatasetHeader";
import OverviewTab from "../../components/workspace/overview/OverviewTab";
import ProfilingTab from "../../components/workspace/profiling/ProfilingTab";
import QualityTab from "../../components/workspace/quality/QualityTab";
import AIReportTab from "../../components/workspace/report/AIReportTab";
import StatisticsTab from "../../components/workspace/statistics/StatisticsTab";
import ValidationTab from "../../components/workspace/validation/ValidationTab";
import VisualizationTab from "../../components/workspace/visualization/VisualizationTab";
import WorkspaceTabs from "../../components/workspace/WorkspaceTabs";

import type {
  Dataset,
} from "../../types/dataset";

import type {
  DatasetProfile,
} from "../../types/profile";


function DatasetWorkspace() {
  const {
    id,
  } = useParams();

  const [
    dataset,
    setDataset,
  ] =
    useState<Dataset | null>(
      null,
    );

  const [
    profile,
    setProfile,
  ] =
    useState<DatasetProfile | null>(
      null,
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "Overview",
    );

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


  useEffect(() => {
    async function loadWorkspace() {
      if (!id) {
        setError(
          "Dataset ID is missing.",
        );

        setLoading(false);

        return;
      }

      const datasetId =
        Number(id);

      if (
        Number.isNaN(
          datasetId,
        )
      ) {
        setError(
          "Invalid dataset ID.",
        );

        setLoading(false);

        return;
      }

      try {
        const [
          datasetData,
          profileData,
        ] =
          await Promise.all([
            getDataset(
              datasetId,
            ),

            getDatasetProfile(
              datasetId,
            ),
          ]);

        setDataset(
          datasetData,
        );

        setProfile(
          profileData,
        );
      } catch {
        setError(
          "Unable to load dataset workspace.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [id]);


  if (loading) {
    return (
      <section className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80">
            <LoaderCircle
              size={25}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-300">
            Loading dataset workspace...
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Preparing profiling and analysis data.
          </p>
        </div>
      </section>
    );
  }


  if (
    error ||
    !dataset ||
    !profile
  ) {
    return (
      <section className="mx-auto max-w-[1500px]">
        <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-6 py-8">
          <p className="text-sm font-medium text-red-300">
            {error ||
              "Dataset not found."}
          </p>

          <p className="mt-2 text-xs text-red-400/70">
            The dataset workspace could not be loaded.
          </p>
        </div>
      </section>
    );
  }


  return (
    <section className="min-h-full text-white">
      <div className="mx-auto max-w-[1500px]">
        {/* Dataset identity / summary */}
        <DatasetHeader
          dataset={
            dataset
          }
          profile={
            profile
          }
        />


        {/* Analysis navigation */}
        <div className="mt-6">
          <WorkspaceTabs
            activeTab={
              activeTab
            }
            onChange={
              setActiveTab
            }
          />
        </div>


        {/* Active analysis module */}
        <div className="mt-6">
          {activeTab ===
            "Overview" && (
            <OverviewTab
              profile={
                profile
              }
            />
          )}


          {activeTab ===
            "Profiling" && (
            <ProfilingTab
              profile={
                profile
              }
            />
          )}


          {activeTab ===
            "Statistics" && (
            <StatisticsTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "Quality" && (
            <QualityTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "Validation" && (
            <ValidationTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "Cleaning" && (
            <CleaningTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "Correlation" && (
            <CorrelationTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "Charts" && (
            <VisualizationTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "AI Report" && (
            <AIReportTab
              datasetId={
                dataset.id
              }
            />
          )}


          {activeTab ===
            "AI Chat" && (
            <AIChatTab
              datasetId={
                dataset.id
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}


export default DatasetWorkspace;