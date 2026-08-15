import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  LoaderCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  downloadSavedReportPdf,
  getSavedReport,
} from "../../api/savedReport.api";

import ReportViewer from "../../components/reports/ReportViewer";

import type {
  SavedReport,
} from "../../types/savedReport";

function formatDate(
  value: string,
): string {
  return new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] =
    useState<SavedReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      if (!id) {
        setError(
          "Report ID is missing.",
        );
        setLoading(false);
        return;
      }

      const reportId = Number(id);

      if (Number.isNaN(reportId)) {
        setError(
          "Invalid report ID.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await getSavedReport(
            reportId,
          );

        if (!cancelled) {
          setReport(response);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load the saved report.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDownloadPdf() {
    if (!report || downloading) {
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const pdfBlob =
        await downloadSavedReportPdf(
          report.id,
        );

      const downloadUrl =
        URL.createObjectURL(pdfBlob);

      const link =
        document.createElement("a");

      const safeTitle = report.title
        .replace(/[\\/:*?"<>|]/g, "-")
        .trim();

      link.href = downloadUrl;
      link.download = `${safeTitle}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(
        downloadUrl,
      );
    } catch {
      setError(
        "Unable to download the report PDF.",
      );
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <div className="text-center">
          <LoaderCircle
            size={28}
            className="mx-auto animate-spin text-blue-300"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading saved report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <section className="space-y-5">
        <button
          type="button"
          onClick={() =>
            navigate("/reports")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Reports
        </button>

        <div className="flex items-start gap-3 rounded-xl border border-red-900 bg-red-950/30 p-5 text-sm text-red-300">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error ||
              "Saved report not found."}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() =>
            navigate("/reports")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Reports
        </button>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText
                  size={20}
                  className="text-blue-300"
                />
              </div>

              <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
                {report.title}
              </h1>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Saved AI analysis report
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays
                size={16}
              />

              Saved{" "}
              {formatDate(
                report.created_at,
              )}
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Download size={16} />
              )}

              {downloading
                ? "Preparing PDF..."
                : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      <ReportViewer
        report={report.report_data}
        datasetName={
          report.title.replace(
            / - AI Report$/,
            "",
          )
        }
        savedReportId={report.id}
      />
    </section>
  );
}

export default ReportDetailsPage;