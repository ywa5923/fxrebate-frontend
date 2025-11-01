'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
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
import type { DynamicOption, DynamicOptionPagination } from '@/types/DynamicOption';

interface DynamicOptionsTableProps {
  data?: DynamicOption[];
  meta?: DynamicOptionPagination;
}

export function DynamicOptionsTable({ data, meta }: DynamicOptionsTableProps) {
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

  const initialColumnVisibility = useMemo(() => ({
    row_number: true,
    name: true,
    slug: true,
    form_type: true,
    data_type: true,
    required: true,
    category_name: false,
    dropdown_category_name: false,
    applicable_for: false,
    for_brokers: false,
    for_crypto: false,
    for_props: false,
  }) as Record<string, boolean>, []);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);
  
  const hasActiveFilters = searchParams.get('category_name') || searchParams.get('dropdown_category_name') || 
    searchParams.get('name') || searchParams.get('applicable_for') || searchParams.get('data_type') || 
    searchParams.get('form_type') || searchParams.get('for_brokers') || searchParams.get('for_crypto') || 
    searchParams.get('for_props') || searchParams.get('required');

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

  const handleSort = (columnId: string) => {
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
  };

  const getSortIcon = (columnId: string) => {
    if (orderBy !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return orderDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const columns: ColumnDef<DynamicOption>[] = [
    {
      id: 'row_number',
      header: '#',
      cell: ({ row }) => {
        const rowNumber = (currentPage - 1) * perPage + (row?.index ?? 0) + 1;
        return <div className="font-medium">{rowNumber}</div>;
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('name')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Name
            {getSortIcon('name')}
          </Button>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('slug')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Slug
            {getSortIcon('slug')}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="font-mono text-sm text-gray-600">
            {row.getValue('slug')}
          </span>
        );
      },
    },
    {
      accessorKey: 'form_type',
      header: 'Form Type',
      cell: ({ row }) => {
        const formType = row.getValue('form_type') as string | null;
        return formType || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'data_type',
      header: 'Data Type',
      cell: ({ row }) => {
        const dataType = row.getValue('data_type') as string | null;
        return dataType || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'required',
      header: 'Required',
      cell: ({ row }) => {
        const required = row.original.required;
        const isRequired = required === 1 || required === true;
        return (
          <div className="text-center">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
              isRequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isRequired ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'category_name',
      header: 'Category Name',
      cell: ({ row }) => {
        const categoryName = row.original.category_name;
        return categoryName || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'dropdown_category_name',
      header: 'Dropdown Category',
      cell: ({ row }) => {
        const dropdownCategoryName = row.original.dropdown_category_name;
        return dropdownCategoryName || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'applicable_for',
      header: 'Applicable For',
      cell: ({ row }) => {
        const applicableFor = row.original.applicable_for;
        return applicableFor || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'for_brokers',
      header: 'For Brokers',
      cell: ({ row }) => {
        const forBrokers = row.original.for_brokers;
        const isTrue = forBrokers === 1 || forBrokers === true;
        return (
          <div className="text-center">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
              isTrue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isTrue ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'for_crypto',
      header: 'For Crypto',
      cell: ({ row }) => {
        const forCrypto = row.original.for_crypto;
        const isTrue = forCrypto === 1 || forCrypto === true;
        return (
          <div className="text-center">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
              isTrue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isTrue ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'for_props',
      header: 'For Props',
      cell: ({ row }) => {
        const forProps = row.original.for_props;
        const isTrue = forProps === 1 || forProps === true;
        return (
          <div className="text-center">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
              isTrue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isTrue ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
  ];

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
            <DropdownMenuContent align="end" className="w-56">
              {table.getAllLeafColumns().map((column) => {
                const columnLabelMap: Record<string, string> = {
                  row_number: '#',
                  name: 'Name',
                  slug: 'Slug',
                  form_type: 'Form Type',
                  data_type: 'Data Type',
                  required: 'Required',
                  category_name: 'Category Name',
                  dropdown_category_name: 'Dropdown Category',
                  applicable_for: 'Applicable For',
                  for_brokers: 'For Brokers',
                  for_crypto: 'For Crypto',
                  for_props: 'For Props',
                };
                const label = columnLabelMap[column.id as string] ?? String(column.id).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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

      <div className="rounded-md border overflow-x-auto">
        <Table>
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
                if (colId === 'name') {
                  control = (
                    <Input
                      id="hdr_name"
                      defaultValue={searchParams.get('name') || ''}
                      key={`rst-${filtersResetKey}-name`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('name', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter name"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'slug') {
                  control = (
                    <Input
                      id="hdr_slug"
                      defaultValue={searchParams.get('slug') || ''}
                      key={`rst-${filtersResetKey}-slug`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('slug', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter slug"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'form_type') {
                  control = (
                    <Input
                      id="hdr_form_type"
                      defaultValue={searchParams.get('form_type') || ''}
                      key={`rst-${filtersResetKey}-form_type`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('form_type', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter form type"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'data_type') {
                  control = (
                    <Input
                      id="hdr_data_type"
                      defaultValue={searchParams.get('data_type') || ''}
                      key={`rst-${filtersResetKey}-data_type`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('data_type', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter data type"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'category_name') {
                  control = (
                    <Input
                      id="hdr_category_name"
                      defaultValue={searchParams.get('category_name') || ''}
                      key={`rst-${filtersResetKey}-category_name`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('category_name', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter category"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'dropdown_category_name') {
                  control = (
                    <Input
                      id="hdr_dropdown_category_name"
                      defaultValue={searchParams.get('dropdown_category_name') || ''}
                      key={`rst-${filtersResetKey}-dropdown_category_name`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('dropdown_category_name', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter dropdown category"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'applicable_for') {
                  control = (
                    <Input
                      id="hdr_applicable_for"
                      defaultValue={searchParams.get('applicable_for') || ''}
                      key={`rst-${filtersResetKey}-applicable_for`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('applicable_for', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter applicable for"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'for_brokers') {
                  control = (
                    <Input
                      id="hdr_for_brokers"
                      defaultValue={searchParams.get('for_brokers') || ''}
                      key={`rst-${filtersResetKey}-for_brokers`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('for_brokers', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter for brokers"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'for_crypto') {
                  control = (
                    <Input
                      id="hdr_for_crypto"
                      defaultValue={searchParams.get('for_crypto') || ''}
                      key={`rst-${filtersResetKey}-for_crypto`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('for_crypto', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter for crypto"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'for_props') {
                  control = (
                    <Input
                      id="hdr_for_props"
                      defaultValue={searchParams.get('for_props') || ''}
                      key={`rst-${filtersResetKey}-for_props`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('for_props', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter for props"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'required') {
                  control = (
                    <Input
                      id="hdr_required"
                      defaultValue={searchParams.get('required') || ''}
                      key={`rst-${filtersResetKey}-required`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('required', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter required"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
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