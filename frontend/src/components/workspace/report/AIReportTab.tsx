import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Save,
  Sparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  generateAIReport,
} from "../../../api/report.api";

import {
  saveReport,
} from "../../../api/savedReport.api";

import ReportViewer from "../../reports/ReportViewer";

import type {
  AIReportResponse,
} from "../../../types/report";


interface AIReportTabProps {
  datasetId: number;
}


type SaveStatus =
  | "idle"
  | "success"
  | "error";


function AIReportTab({
  datasetId,
}: AIReportTabProps) {
  const [
    reportData,
    setReportData,
  ] =
    useState<
      AIReportResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    savedReportId,
    setSavedReportId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    saveMessage,
    setSaveMessage,
  ] =
    useState("");

  const [
    saveStatus,
    setSaveStatus,
  ] =
    useState<SaveStatus>(
      "idle",
    );


  async function handleGenerateReport() {
    setLoading(true);
    setError("");

    setSavedReportId(
      null,
    );

    setSaveMessage("");
    setSaveStatus(
      "idle",
    );

    try {
      const response =
        await generateAIReport(
          datasetId,
        );

      setReportData(
        response,
      );
    } catch {
      setReportData(
        null,
      );

      setError(
        "Unable to generate the AI report.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleSaveReport() {
    if (
      !reportData ||
      saving ||
      savedReportId !== null
    ) {
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setSaveStatus(
      "idle",
    );

    try {
      const savedReport =
        await saveReport({
          dataset_id:
            datasetId,

          title:
            `${reportData.dataset_name} - AI Report`,

          report_data:
            reportData.report,
        });

      setSavedReportId(
        savedReport.id,
      );

      setSaveMessage(
        "Report saved successfully.",
      );

      setSaveStatus(
        "success",
      );
    } catch {
      setSaveMessage(
        "Unable to save the report.",
      );

      setSaveStatus(
        "error",
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot
              size={15}
              className="text-blue-400"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              AI interpretation
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            AI Report
          </h2>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Generate a professional AI interpretation
            covering dataset quality, statistics,
            relationships and recommended next steps.
          </p>
        </div>


        <div className="flex flex-col gap-3 sm:flex-row">
          {reportData &&
            !loading && (
            <button
              type="button"
              onClick={
                handleSaveReport
              }
              disabled={
                saving ||
                savedReportId !==
                  null
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800/60 bg-emerald-950/20 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : savedReportId !==
                null ? (
                <CheckCircle2
                  size={16}
                />
              ) : (
                <Save
                  size={16}
                />
              )}

              {saving
                ? "Saving..."
                : savedReportId !==
                    null
                  ? "Report Saved"
                  : "Save Report"}
            </button>
          )}


          <button
            type="button"
            onClick={
              handleGenerateReport
            }
            disabled={
              loading ||
              saving
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Sparkles
                size={16}
              />
            )}

            {loading
              ? "Generating Report..."
              : reportData
                ? "Regenerate Report"
                : "Generate AI Report"}
          </button>
        </div>
      </div>


      {/* Errors */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error}
          </span>
        </div>
      )}


      {/* Save feedback */}
      {saveMessage && (
        <div
          className={[
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",

            saveStatus ===
            "success"
              ? "border-emerald-900/60 bg-emerald-950/20 text-emerald-300"
              : "border-red-900/60 bg-red-950/20 text-red-300",
          ].join(" ")}
        >
          {saveStatus ===
          "success" ? (
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0"
            />
          )}

          <span>
            {saveMessage}
          </span>
        </div>
      )}


      {/* Empty state */}
      {!reportData &&
        !loading &&
        !error && (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10 text-blue-400">
              <FileText
                size={23}
              />
            </div>

            <h3 className="mt-5 text-base font-semibold text-white">
              Generate your AI analysis report
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              DataPilot AI will interpret the current
              analysis and produce a structured report
              covering key findings, risks and next steps.
            </p>

            <button
              type="button"
              onClick={
                handleGenerateReport
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Sparkles
                size={16}
              />

              Generate AI Report
            </button>
          </div>
        )}


      {/* Generating */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
            <LoaderCircle
              size={24}
              className="animate-spin text-blue-400"
            />
          </div>

          <h3 className="mt-5 text-sm font-semibold text-white">
            Building your analysis report
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Interpreting quality, statistics,
            correlations and analytical recommendations.
          </p>
        </div>
      )}


      {/* Report */}
      {reportData &&
        !loading && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
            <ReportViewer
              report={
                reportData.report
              }
              datasetName={
                reportData.dataset_name
              }
              savedReportId={
                savedReportId
              }
            />
          </div>
        )}
    </section>
  );
}


export default AIReportTab;