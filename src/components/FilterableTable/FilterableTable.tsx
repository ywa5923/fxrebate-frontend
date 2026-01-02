"use client";
//import { DynamicOption } from '@/types/DynamicOption';
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useTransition, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Sliders,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Filter, Eraser } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDynamicOption } from "@/lib/dynamic-option-requests";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilterSection2 from "./FilterSection2";
import { FTProps, FTColumnConfig } from "./types";
import EditActionBtn from "./EditActionBtn";
import DeleteActionBtn from "./DeleteActionBtn";
import ToggleActiveBtn from "./ToggleActiveBtn";
//import type { Broker } from "@/lib/broker-management";
import { Broker } from '@/types';
import Image from "next/image";
// export type FTRowValue = string | boolean | number | null | undefined;

// export interface FTRowData{
//     [key: string]: FTRowValue;
// }



export default function FilterableTable<T>({
  data,
  propertyNameToDisplay="name",
  pagination,
  columnsConfig,
  filters,
  LOCAL_STORAGE_KEY,
  formConfig,
  getItemUrl,
  deleteUrl,
  updateItemUrl,
  toggleActiveUrl,
  dashboardUrl,
}: FTProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  //======State for delete dialog===============//
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [hydrated, setHydrated] = useState(false);
  let [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    setHydrated(true);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null) {
          setShowFilters(Object.keys(parsed).length > 0);
        }
      }
    } catch (e) {
      console.warn("Failed to load saved filters:", e);
    }
  
  }, []);

 

  const filtersCount = useMemo(() => {
    return Object.keys(filters ?? {}).filter((key) => searchParams.has(key))
      .length;
  }, [searchParams, filters]);

  let handleClearFilters = () => {
    let newSearchParams = new URLSearchParams(searchParams.toString());
    Object.keys(filters ?? {}).forEach((key) => {
      newSearchParams.delete(key);
    });

    //setShowFilters(false);
    startTransition(() => {
      router.push(`?${newSearchParams.toString()}`);
    });
  };
  //======Get order by and order direction from search params===============//
  const orderBy = searchParams.get("order_by") || "";
  const orderDirection = searchParams.get("order_direction") || "asc";

  //======Get current page and per page from pagination===============//
  const currentPage = pagination.current_page || 1;
  const totalPages = pagination.last_page || 1;
  const perPage = pagination.per_page || 25;
  const from = pagination.from || 0;
  const to = pagination.to || 0;
  const total = pagination.total || 0;

  //======Get sort icon for a column===============//
  const getSortIcon = (columnKey: string) => {
    if (orderBy !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return orderDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  //======Handle sort for a column===============//
  const handleSort = (columnKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (orderBy !== columnKey) {
      params.set("order_by", columnKey);
    }
    params.set("order_direction", orderDirection === "asc" ? "desc" : "asc");
    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  //======Format cell value for a column===============//
  const formatCellValue = (columnKey: string, value: any) => {
    const colType = columnsConfig[columnKey as keyof T]?.type;
    if (colType === "boolean") {
      const isTrue =
        value === 1 || value === true || value === "1" || value === "true";
      return (
        <div className="text-center">
          <span
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm",
              isTrue
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {isTrue ? "Yes" : "No"}
          </span>
        </div>
      );
    } else {
      const displayValue = colType === "json" ? JSON.stringify(value) : value;
      return (
        <span className=" text-sm text-gray-800 block max-w-[28ch] break-all">
          {displayValue}
        </span>
      );
    }
  };

  //======Build initial column visibility from columnsConfig===============//

  const initialColumnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = { row_number: true }; // Always show row number
    if (columnsConfig) {
      Object.entries(columnsConfig).forEach(([key, config]) => {
        visibility[key] = (config as FTColumnConfig).visible;
      });
    }
    return visibility;
  }, [columnsConfig]);

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(initialColumnVisibility);

  //======Handle page change===============//

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isPending) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("per_page", perPage.toString());

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  //======Generate column defs from columnsConfig===============//
  const columns: ColumnDef<T>[] = useMemo(() => {
    //First add the column for row number
    const cols: ColumnDef<T>[] = [
      {
        id: "row_number",
        header: "#",
        cell: ({ row }) => {
          const rowNumber = (currentPage - 1) * perPage + (row?.index ?? 0) + 1;
          return <div className="font-medium">{rowNumber}</div>;
        },
      },
    ];

    //Parse the columnsConfig and add the columns
    (Object.entries(columnsConfig) as Array<[string, FTColumnConfig]>).forEach(
      ([columnKey, config]) => {
        const isSortable = config.sortable;
        const isImage = config.type === "image";
        const colDef: ColumnDef<T> = {
          id: columnKey, // e.g., "form_type"
          accessorKey: columnKey, // Accesses row.original[columnKey]
          header: isSortable
            ? () => {
                return (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(columnKey)}
                    className="hover:bg-transparent p-0 font-semibold"
                  >
                    {config.label}{" "}
                    {/* e.g., "Form Type" from table_columns["form_type"].label */}
                    {getSortIcon(columnKey)}
                  </Button>
                );
              }
            : config.label, // Use config.label if not sortable
          cell: ({ row }) => {
            const value = row.original[columnKey as keyof T]; // Get value from data using columnKey
            if (isImage) {
              const srcStr = typeof value === "string" ? value : "";
              const startsWithHttp =
                srcStr.startsWith("http://") || srcStr.startsWith("https://");
              if (!startsWithHttp) {
                return (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    No logo
                  </div>
                );
              }
              return (
                <div className="relative w-12 h-12">
                  <Image
                    src={srcStr}
                    alt="Broker logo"
                    fill
                    className="object-contain"
                  />
                </div>
              );
            }
            return formatCellValue(columnKey, value);
          },
        };
        cols.push(colDef);
      }
    );

    // Add Actions column
    cols.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = (row.original as unknown) as { id: string; [propertyNameToDisplay]: string };
       
        return (
          <div className="flex items-center gap-2">
           
            
            {toggleActiveUrl && (
                <ToggleActiveBtn url={toggleActiveUrl+`/${item.id}`} broker={row.original as unknown as Broker} />
            )}
            {getItemUrl && updateItemUrl && formConfig && (
              <EditActionBtn
                getItemUrl={getItemUrl}
                updateItemUrl={updateItemUrl}
                formConfig={formConfig}
                resourceId={item.id}
                resourceName={propertyNameToDisplay ?? "Item"}
              />
            )}
            {dashboardUrl && (
              <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 border-gray-300 hover:bg-orange-400"
              style={{ color: '#1f2937' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1f2937'}
              onClick={() => {
                if (!dashboardUrl) return;
                window.location.href = dashboardUrl.replace('#dashboard_id#', item.id);
              }}
              title={`Go to broker dashboard: ${item.id}`}
            >
              <ArrowUpRight className="h-4 w-4" style={{ color: 'inherit' }} />
            </Button>
            )}
            {deleteUrl && (
              <DeleteActionBtn deleteUrl={deleteUrl} resourceId={item.id} resourcetoDelete={propertyNameToDisplay ?? "Item"} />
            )}
           
          </div>
        );
      },
    });

    return cols;
  }, [
    columnsConfig,
    orderBy,
    orderDirection,
    currentPage,
    perPage,
    searchParams,
  ]);//end of useMemo
  //start of useReactTable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="space-y-4 text-base">
      <AnimatePresence>
        {hydrated && showFilters && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FilterSection2 filters={filters} LOCAL_STORAGE_KEY={LOCAL_STORAGE_KEY} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <div>
          Showing {from} to {to} of {total} dynamic options
        </div>
        <div className="flex items-end gap-2">
          {filtersCount > 0 && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <Eraser className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-dashed border-blue-300"
            title={showFilters ? "Hide Filters" : "Advanced Filters"}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showFilters ? "Hide Filters" : "Advanced Filters"}
            </span>
            {filtersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-orange-500 rounded-full">
                {filtersCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-3 gap-2 shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              >
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Select Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-[300px] overflow-y-auto"
            >
              {table.getAllLeafColumns().map((column) => {
                let label: string;
                if (column.id === "row_number") {
                  label = "#";
                } else if (column.id === "actions") {
                  label = "Actions";
                } else if (
                  columnsConfig &&
                  columnsConfig[column.id as keyof T]
                ) {
                  label = (columnsConfig[
                    column.id as keyof T
                  ] as FTColumnConfig).label;
                } else {
                  // Fallback: format column id
                  label = String(column.id)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                }
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(Boolean(v))}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border w-full" style={{ maxWidth: "100%" }}>
        <div
          className="overflow-x-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#9ca3af #f3f4f6",
          }}
        >
          <Table
            className="w-full"
            style={{ minWidth: "max-content", tableLayout: "auto" }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={index === 0 ? "bg-gray-100 font-bold" : ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={index === 0 ? "bg-gray-50 font-medium" : ""}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No dynamic options found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
            className="h-8 px-2 sm:px-3"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">First</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 px-2 sm:px-3"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          <div className="text-xs sm:text-sm font-medium px-2">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2 sm:px-3"
            title="Next page"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2 sm:px-3"
            title="Last page"
          >
            <span className="hidden sm:inline mr-1">Last</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dynamic option</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete "${
                optionToDelete?.name ?? ""
              }"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
              onClick={() => {
                if (!optionToDelete) return;
                const { id } = optionToDelete;
                startTransition(async () => {
                  const res = await deleteDynamicOption(id);
                  if (res.success) {
                    toast.success("Dynamic option deleted");
                    setDeleteDialogOpen(false);
                    setOptionToDelete(null);
                    router.refresh();
                  } else {
                    toast.error("Failed to delete dynamic option", {
                      description: res.message,
                    });
                  }
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
