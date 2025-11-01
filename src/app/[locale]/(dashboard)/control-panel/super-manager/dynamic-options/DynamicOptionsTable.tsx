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
  const [categoryName, setCategoryName] = useState(searchParams.get('category_name') || '');
  const [dropdownCategoryName, setDropdownCategoryName] = useState(searchParams.get('dropdown_category_name') || '');
  const [name, setName] = useState(searchParams.get('name') || '');
  const [applicableFor, setApplicableFor] = useState(searchParams.get('applicable_for') || '');
  const [dataType, setDataType] = useState(searchParams.get('data_type') || '');
  const [formType, setFormType] = useState(searchParams.get('form_type') || '');
  const [forBrokers, setForBrokers] = useState(searchParams.get('for_brokers') || '');
  const [forCrypto, setForCrypto] = useState(searchParams.get('for_crypto') || '');
  const [forProps, setForProps] = useState(searchParams.get('for_props') || '');
  const [required, setRequired] = useState(searchParams.get('required') || '');

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
  
  const hasActiveFilters = Array.from(filterableColumns).some(key => searchParams.get(key));

  useEffect(() => {
    setCategoryName(searchParams.get('category_name') || '');
    setDropdownCategoryName(searchParams.get('dropdown_category_name') || '');
    setName(searchParams.get('name') || '');
    setApplicableFor(searchParams.get('applicable_for') || '');
    setDataType(searchParams.get('data_type') || '');
    setFormType(searchParams.get('form_type') || '');
    setForBrokers(searchParams.get('for_brokers') || '');
    setForCrypto(searchParams.get('for_crypto') || '');
    setForProps(searchParams.get('for_props') || '');
    setRequired(searchParams.get('required') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.last_page || 1;
  const perPage = meta?.per_page || 25;
  const from = meta?.from || 0;
  const to = meta?.to || 0;
  const total = meta?.total || 0;
  
  const safeData = data || [];

  const orderBy = searchParams.get('order_by') || '';
  const orderDirection = searchParams.get('order_direction') || 'asc';

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.length > 0) {
      params.set(key, value);
    } else {
      params.delete(key);
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
            const value = row.original[columnKey]; // Get value from data using columnKey
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
            const value = row.original[columnKey];
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
    
    if (categoryName) params.set('category_name', categoryName); else params.delete('category_name');
    if (dropdownCategoryName) params.set('dropdown_category_name', dropdownCategoryName); else params.delete('dropdown_category_name');
    if (name) params.set('name', name); else params.delete('name');
    if (applicableFor) params.set('applicable_for', applicableFor); else params.delete('applicable_for');
    if (dataType) params.set('data_type', dataType); else params.delete('data_type');
    if (formType) params.set('form_type', formType); else params.delete('form_type');
    if (forBrokers) params.set('for_brokers', forBrokers); else params.delete('for_brokers');
    if (forCrypto) params.set('for_crypto', forCrypto); else params.delete('for_crypto');
    if (forProps) params.set('for_props', forProps); else params.delete('for_props');
    if (required) params.set('required', required); else params.delete('required');
    
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setCategoryName('');
    setDropdownCategoryName('');
    setName('');
    setApplicableFor('');
    setDataType('');
    setFormType('');
    setForBrokers('');
    setForCrypto('');
    setForProps('');
    setRequired('');
    
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
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropdown_category_name">Dropdown Category</Label>
              <Input
                id="dropdown_category_name"
                placeholder="Filter dropdown category"
                value={dropdownCategoryName}
                onChange={(e) => setDropdownCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Filter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicable_for">Applicable For</Label>
              <Input
                id="applicable_for"
                placeholder="Filter applicable for"
                value={applicableFor}
                onChange={(e) => setApplicableFor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_type">Data Type</Label>
              <Input
                id="data_type"
                placeholder="e.g., string, int, boolean"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form_type">Form Type</Label>
              <Input
                id="form_type"
                placeholder="e.g., string, number, checkbox"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="for_brokers">For Brokers</Label>
              <Input
                id="for_brokers"
                placeholder="Filter for brokers"
                value={forBrokers}
                onChange={(e) => setForBrokers(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="for_crypto">For Crypto</Label>
              <Input
                id="for_crypto"
                placeholder="Filter for crypto"
                value={forCrypto}
                onChange={(e) => setForCrypto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="for_props">For Props</Label>
              <Input
                id="for_props"
                placeholder="Filter for props"
                value={forProps}
                onChange={(e) => setForProps(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required">Required</Label>
              <Input
                id="required"
                placeholder="Filter required"
                value={required}
                onChange={(e) => setRequired(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
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
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9ca3af #f3f4f6' }}>
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