'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteDropdownList } from '@/lib/dropdown-list-requests';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { DropdownList, DropdownListPagination } from '@/types/DropdownList';

interface DropdownListsTableProps {
  data?: DropdownList[];
  meta?: DropdownListPagination;
}

export function DropdownListsTable({ data, meta }: DropdownListsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();

  const [showFilters, setShowFilters] = useState(false);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const initialColumnVisibility = useMemo(() => ({
    row_number: true,
    id: false,
    name: true,
    slug: false,
    options: true,
    description: true,
    created_at: true,
    updated_at: false,
    options_count: true,
    actions: true,
  }) as Record<string, boolean>, []);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);
  const [name, setName] = useState(searchParams.get('name') || '');
  const [slug, setSlug] = useState(searchParams.get('slug') || '');
  const [description, setDescription] = useState(searchParams.get('description') || '');

  const hasActiveFilters = searchParams.get('name') || searchParams.get('slug') || searchParams.get('description');

  useEffect(() => {
    setName(searchParams.get('name') || '');
    setSlug(searchParams.get('slug') || '');
    setDescription(searchParams.get('description') || '');
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: number; name: string } | null>(null);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.length > 0) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
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

  const columns: ColumnDef<DropdownList>[] = [
    {
      id: 'row_number',
      header: '#',
      cell: ({ row }) => {
        const rowNumber = (currentPage - 1) * perPage + (row?.index ?? 0) + 1;
        return <div className="font-medium">{rowNumber}</div>;
      },
    },
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('id')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            ID
            {getSortIcon('id')}
          </Button>
        );
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
    },
    {
      id: 'options',
      header: 'Options',
      cell: ({ row }) => {
        const opts = row.original.options || [];
        if (!opts.length) return <span className="text-gray-400 italic">N/A</span>;
        const concatenated = opts.map((o) => o.label).join(', ');
        return <span className="truncate inline-block max-w-[420px]" title={concatenated}>{concatenated}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('description')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Description
            {getSortIcon('description')}
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue('description') as string | null;
        return value || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('created_at')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Created At
            {getSortIcon('created_at')}
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string | null;
        if (!date) return <span className="text-gray-400 italic">N/A</span>;
        const d = new Date(date);
        if (isNaN(d.getTime())) return <span className="text-gray-400 italic">N/A</span>;
        return d.toISOString().slice(0, 10);
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('updated_at')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Updated At
            {getSortIcon('updated_at')}
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('updated_at') as string | null;
        if (!date) return <span className="text-gray-400 italic">N/A</span>;
        const d = new Date(date);
        if (isNaN(d.getTime())) return <span className="text-gray-400 italic">N/A</span>;
        return d.toISOString().slice(0, 10);
      },
    },
    {
      id: 'options_count',
      header: 'Options count',
      cell: ({ row }) => {
        const count = row.original.options?.length ?? 0;
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
              {count}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/control-panel/super-manager/dropdown-lists/${item.id}/edit`)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit list"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setListToDelete({ id: item.id, name: item.name });
                setDeleteDialogOpen(true);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete list"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (name) params.set('name', name); else params.delete('name');
    if (slug) params.set('slug', slug); else params.delete('slug');
    if (description) params.set('description', description); else params.delete('description');
    params.set('page', '1');
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const handleClearFilters = () => {
    setName('');
    setSlug('');
    setDescription('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('name');
    params.delete('slug');
    params.delete('description');
    params.set('page', '1');
    startTransition(() => router.push(`?${params.toString()}`));
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
              {[searchParams.get('name'), searchParams.get('slug'), searchParams.get('description')].filter(Boolean).length}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Currency"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="e.g., currency"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Currencies list"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
          Showing {from} to {to} of {total} dropdown lists
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
                  id: 'ID',
                  name: 'Name',
                  slug: 'Slug',
                  options: 'Options',
                  description: 'Description',
                  created_at: 'Created At',
                  updated_at: 'Updated At',
                  options_count: 'Options count',
                  actions: 'Actions',
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
                } else if (colId === 'description') {
                  control = (
                    <Input
                      id="hdr_description"
                      defaultValue={searchParams.get('description') || ''}
                      key={`rst-${filtersResetKey}-description`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('description', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter description"
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
                  No dropdown lists found.
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dropdown list</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete "${listToDelete?.name ?? ''}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
              onClick={() => {
                if (!listToDelete) return;
                const { id } = listToDelete;
                startTransition(async () => {
                  const res = await deleteDropdownList(id);
                  if (res.success) {
                    toast.success('List deleted');
                    setDeleteDialogOpen(false);
                    setListToDelete(null);
                    router.refresh();
                  } else {
                    toast.error('Failed to delete list', { description: res.message });
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


