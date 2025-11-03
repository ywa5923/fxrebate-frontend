'use client';

import { useEffect, useMemo, useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Sliders,
  Eraser,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { DynamicOption, DynamicOptionPagination, TableColumnConfig } from '@/types/DynamicOption';

interface DynamicOptionsTableProps {
  data?: DynamicOption[];
  meta?: DynamicOptionPagination;
  tableColumns?: Record<string, TableColumnConfig>;
}

export function DynamicOptionsTable({ data, meta, tableColumns }: DynamicOptionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  
  // Helper to get boolean filter value from URL params (returns "any", "1", or "0")
  const getBooleanFilterValue = (key: string): string => {
    const value = searchParams.get(key);
    if (!value) return 'any';
    if (value === '1' || value === 'true') return '1';
    if (value === '0' || value === 'false') return '0';
    return 'any';
  };
  
  // Single state object for all filters
  const [filters, setFilters] = useState(() => {
    const getBoolValue = (key: string): string => {
      const val = searchParams.get(key);
      if (!val) return 'any';
      if (val === '1' || val === 'true') return '1';
      if (val === '0' || val === 'false') return '0';
      return 'any';
    };

    return {
      category_name: searchParams.get('category_name') || '',
      dropdown_category_name: searchParams.get('dropdown_category_name') || '',
      name: searchParams.get('name') || '',
      applicable_for: searchParams.get('applicable_for') || '',
      data_type: searchParams.get('data_type') || '',
      form_type: searchParams.get('form_type') || '',
      for_brokers: getBoolValue('for_brokers'),
      for_crypto: getBoolValue('for_crypto'),
      for_props: getBoolValue('for_props'),
      required: getBoolValue('required'),
    };
  });

  // Build initial column visibility from table_columns
  const initialColumnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = { row_number: true }; // Always show row number
    if (tableColumns) {
      Object.entries(tableColumns).forEach(([key, config]) => {
        visibility[key] = config.visible;
      });
    } else {
      // Fallback to defaults if tableColumns not provided
      visibility.name = true;
      visibility.slug = true;
      visibility.form_type = true;
      visibility.data_type = true;
      visibility.required = true;
      visibility.category_name = false;
      visibility.dropdown_category_name = false;
      visibility.applicable_for = false;
      visibility.for_brokers = false;
      visibility.for_crypto = false;
      visibility.for_props = false;
    }
    return visibility;
  }, [tableColumns]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);
  
  // Get filterable columns from table_columns
  const filterableColumns = useMemo(() => {
    if (!tableColumns) return new Set(['category_name', 'dropdown_category_name', 'name', 'applicable_for', 'data_type', 'form_type', 'for_brokers', 'for_crypto', 'for_props', 'required']);
    return new Set(Object.entries(tableColumns).filter(([_, config]) => config.filterable).map(([key]) => key));
  }, [tableColumns]);
  
  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.last_page || 1;
  const perPage = meta?.per_page || 25;
  const from = meta?.from || 0;
  const to = meta?.to || 0;
  const total = meta?.total || 0;
  
  const safeData = data || [];
  
  // Identify boolean columns (columns that typically have boolean values)
  const booleanColumns = useMemo(() => {
    const booleanFields = new Set(['for_crypto', 'for_brokers', 'for_props', 'required', 'is_active', 'default_loading', 'load_in_dropdown', 'allow_sorting']);
    // Also check if we have data to infer boolean columns from data_type
    if (safeData.length > 0) {
      const firstItem = safeData[0] as Record<string, any>;
      // Check data_type field or known boolean patterns
      Object.keys(firstItem).forEach((key) => {
        const value = firstItem[key];
        // If value is 0, 1, true, false and column is not already in the set, it might be boolean
        if ((value === 0 || value === 1 || value === true || value === false) && 
            typeof value === 'number' || typeof value === 'boolean') {
          booleanFields.add(key);
        }
      });
    }
    return booleanFields;
  }, [safeData]);
  
  const hasActiveFilters = Array.from(filterableColumns).some(key => searchParams.get(key));

  useEffect(() => {
    setFilters({
      category_name: searchParams.get('category_name') || '',
      dropdown_category_name: searchParams.get('dropdown_category_name') || '',
      name: searchParams.get('name') || '',
      applicable_for: searchParams.get('applicable_for') || '',
      data_type: searchParams.get('data_type') || '',
      form_type: searchParams.get('form_type') || '',
      for_brokers: getBooleanFilterValue('for_brokers'),
      for_crypto: getBooleanFilterValue('for_crypto'),
      for_props: getBooleanFilterValue('for_props'),
      required: getBooleanFilterValue('required'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const orderBy = searchParams.get('order_by') || '';
  const orderDirection = searchParams.get('order_direction') || 'asc';

  const setFilter = (key: string, value: string | boolean | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    // Handle "any" as a special value that removes the filter
    if (value === 'any' || value === undefined || value === null || value === '' || value === false) {
      params.delete(key);
    } else if (value !== undefined && value !== null) {
      // For boolean values, convert to "1" for true, "0" for false
      if (typeof value === 'boolean') {
        params.set(key, value ? '1' : '0');
      } else if (value === '1' || value === '0') {
        // Handle string boolean values
        params.set(key, value);
      } else {
        params.set(key, String(value));
      }
    }
    params.set('page', '1');
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const handleSort = useCallback((columnId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (orderBy === columnId) {
      if (orderDirection === 'asc') {
        params.set('order_direction', 'desc');
      } else {
        params.delete('order_by');
        params.delete('order_direction');
      }
    } else {
      params.set('order_by', columnId);
      params.set('order_direction', 'asc');
    }
    
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [searchParams, orderBy, orderDirection, router, startTransition]);

  const getSortIcon = useCallback((columnId: string) => {
    if (orderBy !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return orderDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  }, [orderBy, orderDirection]);

  // Helper function to format cell value
  const formatCellValue = (columnKey: string, value: any): React.ReactNode => {
    // Boolean-like fields (required, for_brokers, for_crypto, for_props, is_active)
    const booleanFields = ['required', 'for_brokers', 'for_crypto', 'for_props', 'is_active', 'default_loading', 'load_in_dropdown', 'allow_sorting'];
    if (booleanFields.includes(columnKey)) {
      const isTrue = value === 1 || value === true || value === '1' || value === 'true';
      const isRedField = columnKey === 'required' || columnKey === 'is_active';
      return (
        <div className="text-center">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
            isTrue ? (isRedField ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800') : 'bg-gray-100 text-gray-600'
          }`}>
            {isTrue ? 'Yes' : 'No'}
          </span>
        </div>
      );
    }

    // Slug field special formatting
    if (columnKey === 'slug') {
      return (
        <span className="font-mono text-sm text-gray-600">
          {value || <span className="text-gray-400 italic">N/A</span>}
        </span>
      );
    }

    // Default: show value or N/A
    return value || <span className="text-gray-400 italic">N/A</span>;
  };

  // Dynamically build columns from table_columns
  const columns: ColumnDef<DynamicOption>[] = useMemo(() => {
    const cols: ColumnDef<DynamicOption>[] = [
      {
        id: 'row_number',
        header: '#',
        cell: ({ row }) => {
          const rowNumber = (currentPage - 1) * perPage + (row?.index ?? 0) + 1;
          return <div className="font-medium">{rowNumber}</div>;
        },
      },
    ];

    if (tableColumns) {
      // Preserve the order from table_columns as provided by the API
      Object.entries(tableColumns).forEach(([columnKey, config]) => {
        // columnKey is the field name (e.g., "slug", "form_type")
        // config contains { label, visible, sortable, filterable }
        // Example: table_columns["form_type"] = { label: "Form Type", visible: true, sortable: true, filterable: true }
        const isSortable = config.sortable;
        const colDef: ColumnDef<DynamicOption> = {
          id: columnKey, // e.g., "form_type"
          accessorKey: columnKey, // Accesses row.original[columnKey]
          header: isSortable ? () => {
            return (
              <Button
                variant="ghost"
                onClick={() => handleSort(columnKey)}
                className="hover:bg-transparent p-0 font-semibold"
              >
                {config.label} {/* e.g., "Form Type" from table_columns["form_type"].label */}
                {getSortIcon(columnKey)}
              </Button>
            );
          } : config.label, // Use config.label if not sortable
          cell: ({ row }) => {
            const value = (row.original as Record<string, any>)[columnKey]; // Get value from data using columnKey
            return formatCellValue(columnKey, value);
          },
        };
        cols.push(colDef);
      });
    } else {
      // Fallback: build columns from data if tableColumns not provided
      const fallbackColumns: Record<string, { label: string; sortable: boolean; filterable: boolean }> = {
        name: { label: 'Name', sortable: true, filterable: true },
        slug: { label: 'Slug', sortable: true, filterable: true },
        form_type: { label: 'Form Type', sortable: true, filterable: true },
        data_type: { label: 'Data Type', sortable: true, filterable: true },
        required: { label: 'Required', sortable: true, filterable: true },
        category_name: { label: 'Category Name', sortable: true, filterable: true },
        dropdown_category_name: { label: 'Dropdown Category', sortable: true, filterable: true },
        applicable_for: { label: 'Applicable For', sortable: true, filterable: true },
        for_brokers: { label: 'For Brokers', sortable: true, filterable: true },
        for_crypto: { label: 'For Crypto', sortable: true, filterable: true },
        for_props: { label: 'For Props', sortable: true, filterable: true },
      };

      Object.entries(fallbackColumns).forEach(([columnKey, config]) => {
        const colDef: ColumnDef<DynamicOption> = {
          id: columnKey,
          accessorKey: columnKey,
          header: config.sortable ? () => {
            return (
              <Button
                variant="ghost"
                onClick={() => handleSort(columnKey)}
                className="hover:bg-transparent p-0 font-semibold"
              >
                {config.label}
                {getSortIcon(columnKey)}
              </Button>
            );
          } : config.label,
          cell: ({ row }) => {
            const value = (row.original as Record<string, any>)[columnKey];
            return formatCellValue(columnKey, value);
          },
        };
        cols.push(colDef);
      });
    }

    return cols;
  }, [tableColumns, currentPage, perPage, orderBy, orderDirection, handleSort, getSortIcon]);

  const table = useReactTable({
    data: safeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isPending) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    params.set('per_page', perPage.toString());
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filters.category_name) params.set('category_name', filters.category_name); else params.delete('category_name');
    if (filters.dropdown_category_name) params.set('dropdown_category_name', filters.dropdown_category_name); else params.delete('dropdown_category_name');
    if (filters.name) params.set('name', filters.name); else params.delete('name');
    if (filters.applicable_for) params.set('applicable_for', filters.applicable_for); else params.delete('applicable_for');
    if (filters.data_type) params.set('data_type', filters.data_type); else params.delete('data_type');
    if (filters.form_type) params.set('form_type', filters.form_type); else params.delete('form_type');
    
    // Boolean filters
    if (filters.for_brokers !== 'any') params.set('for_brokers', filters.for_brokers); else params.delete('for_brokers');
    if (filters.for_crypto !== 'any') params.set('for_crypto', filters.for_crypto); else params.delete('for_crypto');
    if (filters.for_props !== 'any') params.set('for_props', filters.for_props); else params.delete('for_props');
    if (filters.required !== 'any') params.set('required', filters.required); else params.delete('required');
    
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setFilters({
      category_name: '',
      dropdown_category_name: '',
      name: '',
      applicable_for: '',
      data_type: '',
      form_type: '',
      for_brokers: 'any',
      for_crypto: 'any',
      for_props: 'any',
      required: 'any',
    });
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category_name');
    params.delete('dropdown_category_name');
    params.delete('name');
    params.delete('applicable_for');
    params.delete('data_type');
    params.delete('form_type');
    params.delete('for_brokers');
    params.delete('for_crypto');
    params.delete('for_props');
    params.delete('required');
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
    setFiltersResetKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {[
                searchParams.get('category_name'),
                searchParams.get('dropdown_category_name'),
                searchParams.get('name'),
                searchParams.get('applicable_for'),
                searchParams.get('data_type'),
                searchParams.get('form_type'),
                searchParams.get('for_brokers'),
                searchParams.get('for_crypto'),
                searchParams.get('for_props'),
                searchParams.get('required')
              ].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="ml-2 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <Eraser className="h-4 w-4" />
            <span>Clear all filters</span>
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-gray-50 border-2 border-dashed border-green-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_name">Category Name</Label>
              <Input
                id="category_name"
                placeholder="Filter category name"
                value={filters.category_name}
                onChange={(e) => setFilters({ ...filters, category_name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropdown_category_name">Dropdown Category</Label>
              <Input
                id="dropdown_category_name"
                placeholder="Filter dropdown category"
                value={filters.dropdown_category_name}
                onChange={(e) => setFilters({ ...filters, dropdown_category_name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Filter name"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicable_for">Applicable For</Label>
              <Input
                id="applicable_for"
                placeholder="Filter applicable for"
                value={filters.applicable_for}
                onChange={(e) => setFilters({ ...filters, applicable_for: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_type">Data Type</Label>
              <Input
                id="data_type"
                placeholder="e.g., string, int, boolean"
                value={filters.data_type}
                onChange={(e) => setFilters({ ...filters, data_type: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form_type">Form Type</Label>
              <Input
                id="form_type"
                placeholder="e.g., string, number, checkbox"
                value={filters.form_type}
                onChange={(e) => setFilters({ ...filters, form_type: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="for_brokers">For Brokers</Label>
              <Select
                value={filters.for_brokers}
                onValueChange={(value) => {
                  setFilters({ ...filters, for_brokers: value });
                  setFilter('for_brokers', value);
                }}
              >
                <SelectTrigger id="for_brokers" className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">True</SelectItem>
                  <SelectItem value="0">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="for_crypto">For Crypto</Label>
              <Select
                value={filters.for_crypto}
                onValueChange={(value) => {
                  setFilters({ ...filters, for_crypto: value });
                  setFilter('for_crypto', value);
                }}
              >
                <SelectTrigger id="for_crypto" className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">True</SelectItem>
                  <SelectItem value="0">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="for_props">For Props</Label>
              <Select
                value={filters.for_props}
                onValueChange={(value) => {
                  setFilters({ ...filters, for_props: value });
                  setFilter('for_props', value);
                }}
              >
                <SelectTrigger id="for_props" className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">True</SelectItem>
                  <SelectItem value="0">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required">Required</Label>
              <Select
                value={filters.required}
                onValueChange={(value) => {
                  setFilters({ ...filters, required: value });
                  setFilter('required', value);
                }}
              >
                <SelectTrigger id="required" className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">True</SelectItem>
                  <SelectItem value="0">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              size="sm"
              className="bg-green-900 hover:bg-green-950 text-white"
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <div>
          Showing {from} to {to} of {total} dynamic options
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 gap-2 shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Select Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
              {table.getAllLeafColumns().map((column) => {
                let label: string;
                if (column.id === 'row_number') {
                  label = '#';
                } else if (tableColumns && tableColumns[column.id]) {
                  label = tableColumns[column.id].label;
                } else {
                  // Fallback: format column id
                  label = String(column.id).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
            <TableRow key={`filters-row-${filtersResetKey}`}>
              {table.getHeaderGroups()[0]?.headers.map((header, index) => {
                const colId = header.column.id;
                let control: React.ReactNode = null;
                
                // Only show filter if column is filterable according to table_columns
                if (colId !== 'row_number') {
                  const isFilterable = tableColumns 
                    ? (tableColumns[colId]?.filterable ?? false)
                    : filterableColumns.has(colId);
                  
                  if (isFilterable) {
                    const isBoolean = booleanColumns.has(colId);
                    
                    if (isBoolean) {
                      // Use select for boolean filters (Any, True, False)
                      const filterValue = getBooleanFilterValue(colId);
                      control = (
                        <div className="flex items-center justify-center">
                          <Select
                            key={`rst-${filtersResetKey}-${colId}`}
                            value={filterValue}
                            onValueChange={(value) => {
                              setFilter(colId, value);
                            }}
                          >
                            <SelectTrigger id={`hdr_${colId}`} size="sm" className="h-8 w-full">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="1">True</SelectItem>
                              <SelectItem value="0">False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    } else {
                      // Use input for text filters
                      const placeholder = tableColumns?.[colId]?.label 
                        ? `Filter ${tableColumns[colId].label.toLowerCase()}`
                        : `Filter ${colId.replace(/_/g, ' ')}`;
                      
                      control = (
                        <Input
                          id={`hdr_${colId}`}
                          defaultValue={searchParams.get(colId) || ''}
                          key={`rst-${filtersResetKey}-${colId}`}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter') {
                              setFilter(colId, (e.target as HTMLInputElement).value);
                            }
                          }}
                          className="h-8 text-xs"
                          placeholder={placeholder}
                          style={{ backgroundColor: '#ffffff' }}
                        />
                      );
                    }
                  }
                }
                
                return (
                  <TableHead key={`filter-${header.id}`} className={index === 0 ? 'bg-gray-100 font-bold' : ''}>
                    {control}
                  </TableHead>
                );
              })}
            </TableRow>
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
    </div>
  );
}