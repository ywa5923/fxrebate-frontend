"use client";
//import { DynamicOption } from '@/types/DynamicOption';
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect, useTransition, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Edit } from "lucide-react";
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

import { Button } from "@/components/ui/button";
// export type FTRowValue = string | boolean | number | null | undefined;

// export interface FTRowData{
//     [key: string]: FTRowValue;
// }

export type FTRowData<
  T = string | boolean | number | null | undefined
> = Record<string, T>;

export interface FTPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
export interface FTColumnConfig {
  label: string;
  type: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
}
export type FTColumnsConfig<T> = {
  [K in keyof T]: FTColumnConfig;
};

// type FTColumnsStates<T> = Partial<Record<keyof T, FTColumnState>>;
export type FTSelectOption = {
  label: string;
  value: string | number;
};
export interface FTFilterType {
  type: "text" | "select";
  tooltip?: string;
  options?: FTSelectOption[];
}

export type FTFilters<T> = {
  [K in keyof T]?: FTFilterType;
};

//export type FTFilters<T> = Partial<Record<keyof T, string | boolean>>;

export interface FTData<T> {
  data: T[];
  pagination: FTPagination;
  columnsConfig: FTColumnsConfig<T>;
  filters: FTFilters<T>;
}

export default function FilterableTable<T>({
  data,
  pagination,
  columnsConfig = {},
  filters,
}: FTData<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

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
        <span className="font-mono text-xs text-gray-600 break-all">
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

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);

//======Handle page change===============//

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages || isPending) return;
  
  const params = new URLSearchParams(searchParams.toString());
  params.set('page', newPage.toString());
  params.set('per_page', perPage.toString());
  
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
        // columnKey is the field name (e.g., "slug", "form_type")
        // config contains { label, visible, sortable, filterable }

        const isSortable = config.sortable;
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

            return formatCellValue(columnKey, value);
          },
        };
        cols.push(colDef);
      }
    );

     // Add Actions column
     cols.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original as unknown as { id: string };
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/control-panel/super-manager/dynamic-options/${item.id}/edit`)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit dynamic option"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
               // setOptionToDelete({ id: item.id, name: item.name });
               // setDeleteDialogOpen(true);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete dynamic option"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    });

    return cols;
  }, [columnsConfig,orderBy,orderDirection,currentPage,perPage,searchParams]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });  
    
    
    
    
    
  
  return  (<div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
           <div>
              Showing {from} to {to} of {total} dynamic options
            </div>
          <div className="flex items-center gap-2">Filter bar</div>
          </div>
          <div className="rounded-md border w-full" style={{ maxWidth: '100%' }}>
        <div 
          className="overflow-x-auto" 
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#9ca3af #f3f4f6'
          }}
        >
           <Table className="w-full" style={{ minWidth: 'max-content', tableLayout: 'auto' }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead 
                    key={header.id}
                    className={index === 0 ? 'bg-gray-100 font-bold' : ''}
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
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell 
                      key={cell.id}
                      className={index === 0 ? 'bg-gray-50 font-medium' : ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No dynamic options found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
          </div>
          </div>
          

  </div>)
    
    
    
 
}
