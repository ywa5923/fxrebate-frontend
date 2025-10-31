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
  Edit,
  Trash2,
  X,
  Sliders,
  Eraser
} from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteZone } from '@/lib/zone-requests';
import type { Zone, ZonePagination } from '@/types/Zone';
import { toast } from 'sonner';

interface ZonesTableProps {
  data?: Zone[];
  meta?: ZonePagination;
}

export function ZonesTable({ data, meta }: ZonesTableProps) {
  const formatDateUTC = (value: string | null) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toISOString().slice(0, 10);
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const [name, setName] = useState(searchParams.get('name') || '');
  const [zoneCode, setZoneCode] = useState(searchParams.get('zone_code') || '');
  const initialColumnVisibility = useMemo(() => ({
    index: true,
    id: true,
    name: true,
    zone_code: true,
    created_at: true,
    updated_at: false,
    actions: true,
  }) as Record<string, boolean>, []);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<{ id: number; name: string } | null>(null);

  const hasActiveFilters = searchParams.get('name') || searchParams.get('zone_code');

  // Sync panel with header/URL filters
  useEffect(() => {
    setName(searchParams.get('name') || '');
    setZoneCode(searchParams.get('zone_code') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Safety checks for meta
  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.last_page || 1;
  const perPage = meta?.per_page || 25;
  const from = meta?.from || 0;
  const to = meta?.to || 0;
  const total = meta?.total || 0;
  
  // Safety check for data
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

  const columns: ColumnDef<Zone>[] = [
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
      accessorKey: 'zone_code',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('zone_code')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Zone Code
            {getSortIcon('zone_code')}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="uppercase font-medium text-blue-600">
            {row.getValue('zone_code')}
          </span>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null;
        return description || <span className="text-gray-400 italic">N/A</span>;
      },
    },
    {
      accessorKey: 'countries',
      header: 'Countries',
      cell: ({ row }) => {
        const countries = row.getValue('countries') as string | null;
        if (!countries) return <span className="text-gray-400 italic">N/A</span>;
        return (
          <span className="uppercase font-medium text-purple-600">
            {countries}
          </span>
        );
      },
    },
    {
      accessorKey: 'countries_count',
      header: 'Country #',
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
              {row.getValue('countries_count')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'brokers_count',
      header: 'Brokers',
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
              {row.getValue('brokers_count')}
            </span>
          </div>
        );
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
        const formatted = formatDateUTC(date);
        return formatted === 'N/A' ? (
          <span className="text-gray-400 italic">N/A</span>
        ) : (
          <>{formatted}</>
        );
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
        const formatted = formatDateUTC(date);
        return formatted === 'N/A' ? (
          <span className="text-gray-400 italic">N/A</span>
        ) : (
          <>{formatted}</>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const zone = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/control-panel/super-manager/zones/edit/${zone.id}`)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit zone"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoneToDelete({ id: zone.id, name: zone.name });
                setDeleteDialogOpen(true);
              }}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete zone"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async () => {
    if (!zoneToDelete) return;

    setIsDeleting(true);
    startTransition(async () => {
      try {
        const result = await deleteZone(zoneToDelete.id);
        
        if (result.success) {
          toast.success('Zone Deleted Successfully', {
            description: `Zone "${zoneToDelete.name}" has been deleted.`,
          });
          setDeleteDialogOpen(false);
          setZoneToDelete(null);
          router.refresh();
        } else {
          toast.error('Error Deleting Zone', {
            description: result.message || 'Unknown error occurred.',
          });
        }
      } catch (error) {
        console.error('Error deleting zone:', error);
        toast.error('Error Deleting Zone', {
          description: 'An unexpected error occurred while deleting the zone.',
        });
      } finally {
        setIsDeleting(false);
      }
    });
  };

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
    
    if (name) {
      params.set('name', name);
    } else {
      params.delete('name');
    }
    
    if (zoneCode) {
      params.set('zone_code', zoneCode);
    } else {
      params.delete('zone_code');
    }
    
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setName('');
    setZoneCode('');
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('name');
    params.delete('zone_code');
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
    setFiltersResetKey((k) => k + 1);
  };

  return (
    <>
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Deleting...</p>
          </div>
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the zone <strong>&quot;{zoneToDelete?.name}&quot;</strong>.
              This action cannot be undone and may affect associated countries and brokers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setZoneToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Zone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                {[searchParams.get('name'), searchParams.get('zone_code')].filter(Boolean).length}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Zone Name</Label>
              <Input
                id="name"
                placeholder="e.g., Europe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zone_code">Zone Code</Label>
              <Input
                id="zone_code"
                placeholder="e.g., eu"
                value={zoneCode}
                onChange={(e) => setZoneCode(e.target.value)}
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
          Showing {from} to {to} of {total} zones
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
                  index: '#',
                  id: 'ID',
                  name: 'Zone Name',
                  zone_code: 'Zone Code',
                  created_at: 'Created At',
                  updated_at: 'Updated At',
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
            {/* Second header row with inline filters to align like Brokers */}
            <TableRow key={`filters-row-${filtersResetKey}`}>
              {table.getHeaderGroups()[0]?.headers.map((header, index) => {
                const colId = header.column.id;
                let control: React.ReactNode = null;
                if (colId === 'name') {
                  control = (
                    <Input
                      id="hdr_zone_name"
                      defaultValue={searchParams.get('name') || ''}
                      key={`rst-${filtersResetKey}-name`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('name', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter name"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'zone_code') {
                  control = (
                    <Input
                      id="hdr_zone_code"
                      defaultValue={searchParams.get('zone_code') || ''}
                      key={`rst-${filtersResetKey}-zone_code`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('zone_code', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter code"
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
                  No zones found.
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
    </>
  );
}
