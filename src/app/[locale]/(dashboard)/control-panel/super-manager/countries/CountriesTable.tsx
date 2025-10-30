'use client';

import { useState, useTransition } from 'react';
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
  Trash2,
  X,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteCountry } from '@/lib/country-requests';
import type { Country, CountryPagination } from '@/types/Country';

interface CountriesTableProps {
  data?: Country[];
  meta?: CountryPagination;
}

export function CountriesTable({ data, meta }: CountriesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(searchParams.get('name') || '');
  const [countryCode, setCountryCode] = useState(searchParams.get('country_code') || '');
  const [zoneCode, setZoneCode] = useState(searchParams.get('zone_code') || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<{ id: number; name: string } | null>(null);

  const hasActiveFilters = searchParams.get('name') || searchParams.get('country_code') || searchParams.get('zone_code');

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

  const handleSort = (columnId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // API supports: id, name, country_code, zone_code, created_at, updated_at
    const allowedColumns = ['id', 'name', 'country_code', 'zone_code', 'created_at', 'updated_at'];
    
    if (!allowedColumns.includes(columnId)) {
      // Column not sortable by API
      return;
    }
    
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

  const handleDelete = async () => {
    if (!countryToDelete) return;

    setIsDeleting(true);
    startTransition(async () => {
      try {
        const result = await deleteCountry(countryToDelete.id);
        if (result.success) {
          toast.success('Country Deleted Successfully', {
            description: `Country "${countryToDelete.name}" has been deleted.`,
          });
          setDeleteDialogOpen(false);
          setCountryToDelete(null);
          router.refresh();
        } else {
          toast.error('Error Deleting Country', {
            description: result.message || 'Unknown error occurred.',
          });
        }
      } catch (error) {
        console.error('Error deleting country:', error);
        toast.error('Error Deleting Country', {
          description: 'An unexpected error occurred while deleting the country.',
        });
      } finally {
        setIsDeleting(false);
      }
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

  const columns: ColumnDef<Country>[] = [
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
      accessorKey: 'country_code',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('country_code')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Country Code
            {getSortIcon('country_code')}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="uppercase font-medium text-blue-600">
            {row.getValue('country_code')}
          </span>
        );
      },
    },
    {
      accessorKey: 'zone_name',
      header: 'Zone Name',
      cell: ({ row }) => {
        const zoneName = row.original.zone_name;
        return zoneName || <span className="text-gray-400 italic">N/A</span>;
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
          <span className="uppercase font-medium text-purple-600">
            {row.getValue('zone_code')}
          </span>
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
        if (!date) return <span className="text-gray-400 italic">N/A</span>;
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
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
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const country = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push(`/${locale}/control-panel/super-manager/countries/edit/${country.id}`);
              }}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit country"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCountryToDelete({ id: country.id, name: country.name });
                setDeleteDialogOpen(true);
              }}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete country"
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
    
    if (countryCode) {
      params.set('country_code', countryCode);
    } else {
      params.delete('country_code');
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
    setCountryCode('');
    setZoneCode('');
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('name');
    params.delete('country_code');
    params.delete('zone_code');
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the country <strong>&quot;{countryToDelete?.name}&quot;</strong>.
              This action cannot be undone and may affect associated brokers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCountryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Country
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Deleting...</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
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
              {[searchParams.get('name'), searchParams.get('country_code'), searchParams.get('zone_code')].filter(Boolean).length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-gray-50 border-2 border-dashed border-green-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Country Name</Label>
              <Input
                id="name"
                placeholder="e.g., Romania"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country_code">Country Code</Label>
              <Input
                id="country_code"
                placeholder="e.g., ro"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-600">
        <div>
          Showing {from} to {to} of {total} countries
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
                  No countries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

