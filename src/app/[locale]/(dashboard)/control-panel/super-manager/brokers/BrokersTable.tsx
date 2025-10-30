'use client';

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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink, Power, ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Broker } from '@/lib/broker-management';
import Image from 'next/image';
import { toggleBrokerStatus } from './actions';
import { toast } from 'sonner';
import { useEffect, useState, useTransition } from 'react';

interface BrokersTableProps {
  data: Broker[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

function ToggleActiveButton({ broker }: { broker: Broker }) {
  const [isPending, startTransition] = useTransition();
  
  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleBrokerStatus(broker.id);
        if (result.success) {
          toast.success('Broker status updated successfully');
        } else {
          toast.error(result.message || 'Failed to update broker status');
        }
      } catch (error) {
        toast.error('An error occurred while updating broker status');
      }
    });
  };
  
  return (
    <>
      {isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Updating Broker Status...</p>
          </div>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className={`${
          broker.is_active 
            ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700' 
            : 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400 hover:border-gray-500'
        }`}
        onClick={handleToggle}
        disabled={isPending}
        title={broker.is_active ? 'Deactivate broker' : 'Activate broker'}
      >
        <Power className="h-4 w-4" />
      </Button>
    </>
  );
}

type SortableColumn = 'id' | 'is_active' | 'broker_type' | 'country' | 'zone' | 'trading_name' | 'created_at' | 'updated_at';

interface ColumnConfig {
  currentPage: number;
  perPage: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  onSort: (column: SortableColumn) => void;
}

const createColumns = ({ currentPage, perPage, orderBy, orderDirection, onSort }: ColumnConfig): ColumnDef<Broker>[] => [
  {
    id: 'index',
    header: '#',
    cell: ({ row }) => {
      const rowNumber = (currentPage - 1) * perPage + row.index + 1;
      return <div className="font-medium text-gray-700">{rowNumber}</div>;
    },
    meta: {
      headerClassName: 'bg-gray-100 font-semibold',
      cellClassName: 'bg-gray-50',
    },
  },
  {
    accessorKey: 'id',
    header: () => {
      const isActive = orderBy === 'id';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('id')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          ID
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'logo',
    header: 'Logo',
    cell: ({ row }) => {
      const logo = row.getValue('logo') as string;
      const isCloudflareUrl = logo && (
        logo.includes('cloudflare') || 
        logo.includes('imagedelivery.net') ||
        logo.startsWith('http')
      );
      
      return isCloudflareUrl ? (
        <div className="w-12 h-12 relative">
          <Image
            src={logo}
            alt="Broker logo"
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">No logo</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'trading_name',
    header: () => {
      const isActive = orderBy === 'trading_name';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('trading_name')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Trading Name
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('trading_name')}</div>
    ),
  },
  {
    accessorKey: 'broker_type',
    header: () => {
      const isActive = orderBy === 'broker_type';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('broker_type')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Type
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('broker_type')}</div>,
  },
  {
    accessorKey: 'country_code',
    header: () => {
      const isActive = orderBy === 'country';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('country')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Country
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const code = row.getValue('country_code') as string | null;
      return <div>{code || '-'}</div>;
    },
  },
  {
    accessorKey: 'zone_code',
    header: () => {
      const isActive = orderBy === 'zone';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('zone')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Zone
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const code = row.getValue('zone_code') as string | null;
      return <div>{code || '-'}</div>;
    },
  },
  {
    accessorKey: 'is_active',
    header: () => {
      const isActive = orderBy === 'is_active';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('is_active')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Status
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={isActive ? 'text-green-700 font-medium' : 'text-gray-500'}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'home_url',
    header: 'Website',
    cell: ({ row }) => {
      const url = row.getValue('home_url') as string;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Visit
        </a>
      ) : (
        '-'
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: () => {
      const isActive = orderBy === 'created_at';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('created_at')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Created At
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string;
      return date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : '-';
    },
  },
  {
    accessorKey: 'updated_at',
    header: () => {
      const isActive = orderBy === 'updated_at';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort('updated_at')}
          className="h-8 px-2 hover:bg-gray-100"
        >
          Updated At
          {isActive ? (
            orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('updated_at') as string;
      return date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : '-';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const broker = row.original;
      // Get locale from URL or default to 'en'
      const currentLocale = typeof window !== 'undefined' 
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en';
      const dashboardUrl = `/${currentLocale}/control-panel/${broker.id}/broker-profile/1/general-information`;
      
      return (
        <div className="flex gap-2">
          <ToggleActiveButton broker={broker} />
          <Button
            variant="outline"
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 hover:border-emerald-800"
            onClick={() => {
              window.location.href = dashboardUrl;
            }}
            title="Go to broker dashboard"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function BrokersTable({ data, meta }: BrokersTableProps) {
  const formatDateUTC = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [filtersResetKey, setFiltersResetKey] = useState(0);

  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.last_page || 1;
  const perPage = meta?.per_page || 25;
  const total = meta?.total || data.length;
  
  const orderBy = searchParams.get('order_by') || undefined;
  const orderDirection = (searchParams.get('order_direction') as 'asc' | 'desc') || undefined;
  
  // Filter values
  const [brokerType, setBrokerType] = useState(searchParams.get('broker_type') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [zone, setZone] = useState(searchParams.get('zone') || '');
  const [tradingName, setTradingName] = useState(searchParams.get('trading_name') || '');
  const [isActive, setIsActive] = useState(searchParams.get('is_active') || '');
  
  const hasActiveFilters = searchParams.get('broker_type') || searchParams.get('country') || 
                          searchParams.get('zone') || searchParams.get('trading_name') || searchParams.get('is_active');

  // Sync panel with header/URL filters
  useEffect(() => {
    setBrokerType(searchParams.get('broker_type') || '');
    setCountry(searchParams.get('country') || '');
    setZone(searchParams.get('zone') || '');
    setTradingName(searchParams.get('trading_name') || '');
    setIsActive(searchParams.get('is_active') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSort = (column: SortableColumn) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // If clicking the same column, toggle direction
      if (orderBy === column) {
        if (orderDirection === 'asc') {
          params.set('order_direction', 'desc');
        } else if (orderDirection === 'desc') {
          // Remove sorting
          params.delete('order_by');
          params.delete('order_direction');
        }
      } else {
        // New column, default to ascending
        params.set('order_by', column);
        params.set('order_direction', 'asc');
      }
      
      // Reset to page 1 when sorting changes
      params.set('page', '1');
      
      router.push(`/${locale}/control-panel/super-manager/brokers?${params.toString()}`);
    });
  };

  const columns = createColumns({ 
    currentPage, 
    perPage, 
    orderBy, 
    orderDirection, 
    onSort: handleSort 
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/${locale}/control-panel/super-manager/brokers?${params.toString()}`);
    });
  };

  const handleApplyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset to page 1 when filtering
      params.set('page', '1');
      
      // Set or remove filters
      if (brokerType) {
        params.set('broker_type', brokerType);
      } else {
        params.delete('broker_type');
      }
      
      if (country) {
        params.set('country', country);
      } else {
        params.delete('country');
      }
      
      if (zone) {
        params.set('zone', zone);
      } else {
        params.delete('zone');
      }
      
      if (tradingName) {
        params.set('trading_name', tradingName);
      } else {
        params.delete('trading_name');
      }

      if (isActive && isActive !== 'any') {
        params.set('is_active', isActive);
      } else {
        params.delete('is_active');
      }
      
      router.push(`/${locale}/control-panel/super-manager/brokers?${params.toString()}`);
    });
  };

  const setHeaderFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/brokers?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setBrokerType('');
    setCountry('');
    setZone('');
    setTradingName('');
    setIsActive('');
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('broker_type');
      params.delete('country');
      params.delete('zone');
      params.delete('trading_name');
      params.delete('is_active');
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/brokers?${params.toString()}`);
    });
    setFiltersResetKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
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
              {[searchParams.get('broker_type'), searchParams.get('country'), searchParams.get('zone'), searchParams.get('trading_name')].filter(Boolean).length}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trading_name">Trading Name</Label>
              <Input
                id="trading_name"
                placeholder="e.g., Trading"
                value={tradingName}
                onChange={(e) => setTradingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="broker_type">Broker Type</Label>
              <Input
                id="broker_type"
                placeholder="e.g., Brokers"
                value={brokerType}
                onChange={(e) => setBrokerType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., ro"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Input
                id="zone"
                placeholder="e.g., eu"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select onValueChange={(v) => setIsActive(v)} defaultValue={isActive || undefined}>
                <SelectTrigger id="is_active">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">ANY</SelectItem>
                  <SelectItem value="1">ACTIVE</SelectItem>
                  <SelectItem value="0">INACTIVE</SelectItem>
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
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={(header.column.columnDef.meta as any)?.headerClassName}
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
            {/* Inline filters row */
            }
            <TableRow key={`filters-row-${filtersResetKey}`}>
              {table.getHeaderGroups()[0]?.headers.map((header) => {
                const colId = header.column.id;
                let control: React.ReactNode = null;
                if (colId === 'trading_name') {
                  control = (
                    <Input
                      id="hdr_trading_name"
                      defaultValue={searchParams.get('trading_name') || ''}
                      key={`rst-${filtersResetKey}-trading_name`}
                      onKeyDown={(e) => e.key === 'Enter' && setHeaderFilter('trading_name', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter name"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'broker_type') {
                  control = (
                    <Input
                      id="hdr_broker_type"
                      defaultValue={searchParams.get('broker_type') || ''}
                      key={`rst-${filtersResetKey}-broker_type`}
                      onKeyDown={(e) => e.key === 'Enter' && setHeaderFilter('broker_type', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter type"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'country_code') {
                  control = (
                    <Input
                      id="hdr_country"
                      defaultValue={searchParams.get('country') || ''}
                      key={`rst-${filtersResetKey}-country`}
                      onKeyDown={(e) => e.key === 'Enter' && setHeaderFilter('country', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter country"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'zone_code') {
                  control = (
                    <Input
                      id="hdr_zone"
                      defaultValue={searchParams.get('zone') || ''}
                      key={`rst-${filtersResetKey}-zone`}
                      onKeyDown={(e) => e.key === 'Enter' && setHeaderFilter('zone', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter zone"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'is_active') {
                  control = (
                    <Select onValueChange={(v) => setHeaderFilter('is_active', v === 'any' ? '' : v)} defaultValue={(searchParams.get('is_active') as string) || 'any'}>
                      <SelectTrigger className="h-8" key={`rst-${filtersResetKey}-is_active`}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">ANY</SelectItem>
                        <SelectItem value="1">ACTIVE</SelectItem>
                        <SelectItem value="0">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }
                return (
                  <TableHead key={`filter-${header.id}`} className={(header.column.columnDef.meta as any)?.headerClassName}>
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
                  className={!row.original.is_active ? 'bg-red-50/70' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.cellClassName}
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
                  No brokers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * perPage) + 1} to{' '}
          {Math.min(currentPage * perPage, total)} of {total} brokers
        </div>
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

