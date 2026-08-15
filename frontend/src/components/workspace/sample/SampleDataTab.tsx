import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type SortChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Download } from "lucide-react";

import { getDatasetSample } from "../../../api/sampleData.api";

import type {
  DatasetSampleResponse,
  SampleRow,
} from "../../../types/sampleData";

import SamplePagination from "./SamplePagination";
import SampleToolbar from "./SampleToolbar";

ModuleRegistry.registerModules([AllCommunityModule]);

const dataPilotGridTheme = themeQuartz.withParams({
  accentColor: "#3b82f6",
  backgroundColor: "#020617",
  borderColor: "#1e293b",
  browserColorScheme: "dark",
  foregroundColor: "#e2e8f0",
  headerBackgroundColor: "#0f172a",
  headerTextColor: "#cbd5e1",
  oddRowBackgroundColor: "#07101f",
  rowHoverColor: "#0f2747",
  selectedRowBackgroundColor: "#172554",
  spacing: 8,
  wrapperBorderRadius: 12,
});

interface SampleDataTabProps {
  datasetId: number;
}

function SampleDataTab({
  datasetId,
}: SampleDataTabProps) {
  const gridRef =
    useRef<AgGridReact<SampleRow>>(null);

  const [data, setData] =
    useState<DatasetSampleResponse | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState(25);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("asc");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadSampleData() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDatasetSample(datasetId, {
            page,
            pageSize,
            search,
            sortBy: sortBy || undefined,
            sortOrder,
          });

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load sample data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSampleData();

    return () => {
      cancelled = true;
    };
  }, [
    datasetId,
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  ]);

  const columnDefs = useMemo<
    ColDef<SampleRow>[]
  >(() => {
    if (!data) {
      return [];
    }

    return data.columns.map(
      (column, index) => ({
        field: column,
        headerName: column,
        minWidth: index === 0 ? 130 : 150,
        width:
          column.toLowerCase().includes("text") ||
          column.toLowerCase().includes("tweet")
            ? 420
            : undefined,
        flex:
          column.toLowerCase().includes("text") ||
          column.toLowerCase().includes("tweet")
            ? 1
            : undefined,
        sortable: true,
        resizable: true,
        sort:
          sortBy === column
            ? sortOrder
            : null,
        valueFormatter: ({ value }) => {
          if (
            value === null ||
            value === undefined ||
            value === ""
          ) {
            return "—";
          }

          return String(value);
        },
        tooltipValueGetter: ({ value }) =>
          value === null ||
          value === undefined
            ? "—"
            : String(value),
      }),
    );
  }, [data, sortBy, sortOrder]);

  const defaultColDef =
    useMemo<ColDef<SampleRow>>(
      () => ({
        filter: false,
        suppressMovable: false,
        wrapHeaderText: false,
      }),
      [],
    );

  const handleSortChanged = useCallback(
    (event: SortChangedEvent<SampleRow>) => {
      const sortedColumn =
        event.api
          .getColumnState()
          .find((column) => column.sort);

      if (!sortedColumn?.colId) {
        setSortBy("");
        setSortOrder("asc");
        setPage(1);
        return;
      }

      setSortBy(sortedColumn.colId);
      setSortOrder(
        sortedColumn.sort === "desc"
          ? "desc"
          : "asc",
      );
      setPage(1);
    },
    [],
  );

  function handlePageSizeChange(
    value: number,
  ) {
    setPageSize(value);
    setPage(1);
  }

  function exportVisibleRows() {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `dataset-${datasetId}-page-${page}.csv`,
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Sample Data
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Inspect, search and sort dataset
            records.
          </p>
        </div>

        <button
          type="button"
          onClick={exportVisibleRows}
          disabled={!data?.rows.length}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={16} />
          Export visible rows
        </button>
      </div>

      <SampleToolbar
        search={searchInput}
        pageSize={pageSize}
        totalRows={data?.total_rows ?? 0}
        onSearchChange={setSearchInput}
        onPageSizeChange={
          handlePageSizeChange
        }
      />

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && (
        <div className="relative h-[560px] overflow-hidden rounded-xl border border-slate-800">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 text-sm text-slate-300">
              Loading records...
            </div>
          )}

          <AgGridReact<SampleRow>
            ref={gridRef}
            theme={dataPilotGridTheme}
            rowData={data?.rows ?? []}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={44}
            headerHeight={46}
            animateRows
            tooltipShowDelay={300}
            suppressCellFocus={false}
            suppressMultiSort
            onSortChanged={
              handleSortChanged
            }
            overlayNoRowsTemplate="<span>No matching rows found.</span>"
          />
        </div>
      )}

      {data && !error && (
        <SamplePagination
          page={data.page}
          totalPages={data.total_pages}
          totalRows={data.total_rows}
          pageSize={data.page_size}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

export default SampleDataTab;