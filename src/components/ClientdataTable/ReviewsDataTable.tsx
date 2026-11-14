"use client";

import { useEffect, useMemo, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, ChevronDown, Search } from "lucide-react";
import {
  flexRender, functionalUpdate, getCoreRowModel, getPaginationRowModel, getSortedRowModel,
  useReactTable, type Column, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import FilterPanel, { type FilterConfig } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import BrokerTableCell from "./BrokerTableCell";
import {
  FALLBACK_DEFAULT_COLUMN_COUNT, filterBrokers, getPagination, getVisiblePageNumbers,
  setPageParam, updateTableUrl,
  type BrokerTableColumn, type BrokerTableDefaultColumn, type BrokerTableRow,
} from "./reviews-table";

type ReviewsDataTableProps = {
  brokers: BrokerTableRow[];
  columnsConfig: BrokerTableColumn[];
  defaultColumns: BrokerTableDefaultColumn[];
  filtersConfig: FilterConfig | null;
  activeTabLabel: string;
};

export default function ReviewsDataTable({
  brokers, columnsConfig, defaultColumns, filtersConfig, activeTabLabel,
}: ReviewsDataTableProps) {
  const searchParams = useSearchParams();
  const globalFilter = searchParams.get("search") ?? "";
  const filteredBrokers = useMemo(() => filterBrokers(brokers, globalFilter), [brokers, globalFilter]);

  const selectedColumnKeys = useMemo(() => {
    const available = new Set(columnsConfig.map((column) => column.key));
    const rawSelection = searchParams.get("columns");
    if (rawSelection !== null) return rawSelection.split(",").filter((key) => available.has(key));
    const defaults = defaultColumns.map((column) => column.key).filter((key) => available.has(key));
    return defaults.length ? defaults : columnsConfig.slice(0, FALLBACK_DEFAULT_COLUMN_COUNT).map((column) => column.key);
  }, [columnsConfig, defaultColumns, searchParams]);

  const columnVisibility = useMemo(
    () => Object.fromEntries(columnsConfig.map((column) => [column.key, selectedColumnKeys.includes(column.key)])),
    [columnsConfig, selectedColumnKeys],
  );
  const sorting = useMemo<SortingState>(() => {
    const key = searchParams.get("order_by");
    const direction = searchParams.get("order_direction");
    return key && (direction === "asc" || direction === "desc") &&
      columnsConfig.some((column) => column.key === key && column.allow_order_by)
      ? [{ id: key, desc: direction === "desc" }]
      : [];
  }, [columnsConfig, searchParams]);

  const rawPage = searchParams.get("page");
  const { page: currentPage, pageCount, pageIndex, pageSize } = getPagination(rawPage, filteredBrokers.length);
  const pagination = { pageIndex, pageSize };

  useEffect(() => {
    const canonicalPage = currentPage > 1 ? String(currentPage) : null;
    if (rawPage === canonicalPage) return;
    updateTableUrl((params) => {
      // Don't overwrite a newer navigation while correcting an invalid URL page.
      if (params.get("page") === rawPage) setPageParam(params, currentPage);
    }, "replace");
  }, [rawPage, currentPage]);

  const tableColumns = useMemo<ColumnDef<BrokerTableRow>[]>(
    () => columnsConfig.map((config) => ({
      id: config.key,
      accessorKey: config.key,
      enableSorting: config.allow_order_by === true,
      header: ({ column }) => <ColumnHeader column={column} label={config.label || config.key} />,
      cell: ({ getValue }) => <BrokerTableCell value={getValue()} config={config} />,
    })),
    [columnsConfig],
  );

  const table = useReactTable({
    data: filteredBrokers,
    columns: tableColumns,
    getRowId: (row, index) => String(row.broker_id ?? index),
    state: { sorting, pagination, columnVisibility },
    pageCount,
    // URL state owns page resets; automatic resets break restored pages after a data fetch.
    autoResetPageIndex: false,
    onSortingChange: (updater) => {
      const sort = functionalUpdate(updater, sorting)[0];
      updateTableUrl((params) => {
        if (sort) {
          params.set("order_by", sort.id);
          params.set("order_direction", sort.desc ? "desc" : "asc");
        } else {
          params.delete("order_by");
          params.delete("order_direction");
        }
        params.delete("page");
      });
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      updateTableUrl((params) => setPageParam(params, next.pageIndex + 1));
    },
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = String(new FormData(event.currentTarget).get("search") ?? "").trim();
    updateTableUrl((params) => {
      if (search) params.set("search", search);
      else params.delete("search");
      params.delete("page");
    });
  }

  const rows = table.getRowModel().rows;

  return (
    <section aria-label={`${activeTabLabel} ratings and reviews`}>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form key={globalFilter} onSubmit={submitSearch} className="flex h-11 w-full items-center gap-2 rounded-md border border-[#0c110f]/20 px-3.5 dark:border-white/30 md:max-w-[429px]">
          <Search className="size-5 shrink-0" aria-hidden="true" />
          <input
            name="search"
            defaultValue={globalFilter}
            placeholder="Search"
            aria-label="Search brokers"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#0c110f]/60 dark:placeholder:text-white/70"
          />
        </form>

        <div className="flex w-full items-center gap-2 md:w-auto md:flex-1 md:justify-between">
          <div className="flex-1 [&>button]:w-full md:flex-none md:[&>button]:w-auto">
            {filtersConfig ? (
              <FilterPanel triggerLabel="Show Filter" config={filtersConfig} />
            ) : (
              <button
                type="button"
                disabled
                className="h-11 rounded-md bg-[#0c110f] px-4 text-sm font-medium text-white opacity-60 dark:bg-white dark:text-[#0c110f]"
              >
                Show Filter
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-[115px] justify-center gap-2 rounded-md border-[#0c110f]/20 bg-transparent px-4 text-xs font-medium text-[#0c110f] dark:border-white/30 dark:text-white"
              >
                Column
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
              <DropdownMenuLabel>Choose columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columnsConfig.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={selectedColumnKeys.includes(column.key)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => {
                    const nextKeys = checked
                      ? [...selectedColumnKeys, column.key]
                      : selectedColumnKeys.filter((key) => key !== column.key);
                    updateTableUrl((params) => params.set("columns", nextKeys.join(",")));
                  }}
                >
                  {column.label || column.key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table className="min-w-[900px] border-collapse text-sm md:min-w-[1120px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-[#676767]/30 hover:bg-transparent dark:border-white/20">
              <TableHead
                scope="col"
                aria-label="Row number"
                className="h-10 w-12 min-w-12 border-b border-[#676767]/30 px-3 py-2 text-right text-sm font-medium text-[#676767] dark:border-white/20 dark:text-gray-300"
              >
                #
              </TableHead>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 min-w-[136px] border-b border-[#676767]/30 px-4 py-2 text-left text-sm font-medium text-[#676767] dark:border-white/20 dark:text-gray-300"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <TableRow key={row.id} className="h-[94px] border-[#676767]/20 hover:bg-transparent dark:border-white/15">
                <TableCell className="w-12 min-w-12 border-b border-[#676767]/20 px-3 py-3 text-right align-middle text-[#0c110f]/60 tabular-nums dark:border-white/15 dark:text-gray-400">
                  {pageIndex * pageSize + rowIndex + 1}
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="max-w-[280px] border-b border-[#676767]/20 px-4 py-3 align-middle text-[#0c110f] dark:border-white/15 dark:text-gray-100">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length + 1}
                className="h-24 border-b border-[#676767]/20 text-center text-sm text-[#0c110f]/60 dark:border-white/15 dark:text-gray-300"
              >
                No brokers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <nav aria-label="Table pagination" className="mt-6 flex flex-wrap items-center justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex h-9 items-center gap-2 px-2 text-[#0c110f] disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Previous</span>
        </button>
        {getVisiblePageNumbers(currentPage, pageCount).map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-[#0c110f]/70 dark:text-gray-300" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              aria-current={currentPage === pageNumber ? "page" : undefined}
              onClick={() => table.setPageIndex(pageNumber - 1)}
              className={cn(
                "h-9 min-w-9 rounded-md px-2 text-center",
                currentPage === pageNumber
                  ? "border border-[#0c110f]/20 text-[#0c110f] dark:border-white/25 dark:text-white"
                  : "text-[#0c110f] hover:bg-black/5 dark:text-gray-100 dark:hover:bg-white/10",
              )}
            >
              {pageNumber}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="inline-flex h-9 items-center gap-2 px-2 text-[#0c110f] disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-100"
        >
          <span>Next</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}

function ColumnHeader({ column, label }: { column: Column<BrokerTableRow>; label: string }) {
  if (!column.getCanSort()) return <span>{label}</span>;
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="inline-flex items-center gap-2 text-left font-medium text-[#676767] hover:text-[#0c110f] dark:text-gray-300 dark:hover:text-white"
      aria-label={`Sort by ${label}`}
    >
      <span>{label}</span>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
    </button>
  );
}
