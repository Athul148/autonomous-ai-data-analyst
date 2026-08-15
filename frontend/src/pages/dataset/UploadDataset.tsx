import { type ChangeEvent, type FormEvent, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import apiClient from "../../api/client";
import type { Dataset } from "../../types/dataset";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadDataset() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedDataset, setUploadedDataset] =
    useState<Dataset | null>(null);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0] ?? null;

    setError("");
    setUploadedDataset(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!extension || !["csv", "xlsx"].includes(extension)) {
      setFile(null);
      setError("Only CSV and XLSX files are supported.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!file) {
      setError("Select a dataset before uploading.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadedDataset(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<Dataset>(
        "/datasets/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUploadedDataset(response.data);
      setFile(null);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ||
            requestError.response?.data?.detail ||
            "Dataset upload failed.",
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">
              Autonomous AI Data Analyst
            </h1>
            <p className="text-sm text-slate-400">
              Upload Dataset
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div>
          <h2 className="text-2xl font-semibold">
            Upload a dataset
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Upload a CSV or Excel file. The platform will
            automatically inspect, profile, and prepare it for
            analysis.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <label
            htmlFor="dataset-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 px-6 py-12 text-center hover:border-blue-500"
          >
            <UploadCloud
              size={36}
              className="text-blue-400"
            />

            <p className="mt-4 font-medium">
              Select CSV or XLSX file
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Maximum supported size: 50 MB
            </p>

            <input
              id="dataset-file"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet
                  size={20}
                  className="shrink-0 text-blue-400"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading and profiling..."
              : "Upload Dataset"}
          </button>
        </form>

        {uploadedDataset && (
          <div className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/40 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={22}
                className="mt-0.5 text-emerald-400"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-emerald-200">
                  Dataset uploaded successfully
                </h3>

                <p className="mt-1 text-sm text-emerald-300/80">
                  {uploadedDataset.rows.toLocaleString("en-IN")} rows
                  and {uploadedDataset.columns} columns were detected.
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/datasets/${uploadedDataset.id}`,
                      )
                    }
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Open Dataset
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg border border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-950"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default UploadDataset;